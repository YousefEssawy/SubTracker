/**
 * scripts/backfill-recurrences.js
 *
 * Backfill script to migrate legacy Recurrence documents to the canonical schema
 * across all users in Firestore.
 *
 * OPERATOR INSTRUCTIONS:
 * 1. ADMIN CREDENTIALS REQUIRED: This script must be run by an operator with
 *    administrative privileges. Credentials must be supplied via:
 *      - GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
 *    Or when testing against the Firebase Emulator suite:
 *      - FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"
 *        (The Firebase Admin SDK automatically detects FIRESTORE_EMULATOR_HOST
 *        and routes requests to the local emulator without requiring credentials).
 *
 * 2. DRY-RUN BY DEFAULT: Bare invocation (`node scripts/backfill-recurrences.js`)
 *    is strictly read-only and performs zero writes. Always inspect the dry-run
 *    summary and preview before applying changes.
 *    Pass `--apply` to commit writes to Firestore.
 *
 * 3. IDEMPOTENT & RE-RUNNABLE: Documents already conforming to the canonical schema
 *    are skipped. Running this script multiple times produces no additional changes.
 *
 * 4. STRICT ANCHOR INTEGRITY: If a legacy document has no valid anchor date
 *    (in nextDate or nextExecutionDate), the script fails loudly and halts immediately
 *    to prevent writing guesses. To skip invalid documents and continue migrating
 *    valid ones, pass `--skip-invalid`.
 *
 * Usage:
 *   Dry run:
 *     node scripts/backfill-recurrences.js
 *   Apply:
 *     node scripts/backfill-recurrences.js --apply
 *   Apply with invalid document skipping:
 *     node scripts/backfill-recurrences.js --apply --skip-invalid
 *   Against emulator:
 *     FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 GCLOUD_PROJECT=subtracker-test node scripts/backfill-recurrences.js
 */

import { createRequire } from "node:module";

// firebase-admin is installed in functions/, not at the repo root.
// We resolve it using createRequire anchored to functions/package.json to avoid
// adding any root dependencies or modifying package.json.
let adminApp;
let adminFirestore;

try {
  const fnRequire = createRequire(new URL("../functions/package.json", import.meta.url));
  adminApp = fnRequire("firebase-admin/app");
  adminFirestore = fnRequire("firebase-admin/firestore");
} catch (errFunctions) {
  try {
    const rootRequire = createRequire(import.meta.url);
    adminApp = rootRequire("firebase-admin/app");
    adminFirestore = rootRequire("firebase-admin/firestore");
  } catch (errRoot) {
    console.error("FATAL: Unable to resolve firebase-admin from functions/node_modules or local node_modules.");
    console.error("Functions resolution error:", errFunctions.message);
    console.error("Root resolution error:", errRoot.message);
    process.exit(1);
  }
}

const { initializeApp, getApps } = adminApp;
const { getFirestore, FieldValue } = adminFirestore;

if (!getApps().length) {
  const options = {};
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GCLOUD_PROJECT) {
    options.projectId = "subtracker";
  }
  initializeApp(Object.keys(options).length > 0 ? options : undefined);
}

const db = getFirestore();

// Firestore batch limit is 500 writes
const BATCH_SIZE = 500;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validates whether a date string is a valid YYYY-MM-DD calendar date.
 * Rejects nonexistent calendar dates (e.g. Feb 31, non-leap year Feb 29).
 */
function isValidDate(dateStr) {
  if (typeof dateStr !== "string" || !DATE_REGEX.test(dateStr)) {
    return false;
  }
  const d = new Date(dateStr + "T00:00:00Z");
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === dateStr;
}

/**
 * Predicate matching isLegacyRecurrenceDoc in src/models/mappers.ts:
 * A document is legacy when it lacks a valid status OR lacks a non-empty nextDate.
 * Hybrid documents possessing both valid status and non-empty nextDate are canonical.
 */
function isLegacyRecurrenceDoc(data) {
  const hasStatus =
    data.status === "active" ||
    data.status === "paused" ||
    data.status === "completed";
  const hasNextDate =
    typeof data.nextDate === "string" && data.nextDate.length > 0;
  return !(hasStatus && hasNextDate);
}

/**
 * Normalises status matching asRecurrenceStatus in src/models/mappers.ts.
 * Legacy documents derive status from isActive === true ? "active" : "paused".
 * A legacy document cannot be "completed".
 */
function asRecurrenceStatus(status, isActive) {
  if (status === "active" || status === "paused" || status === "completed") {
    return status;
  }
  if (typeof isActive === "boolean") {
    return isActive ? "active" : "paused";
  }
  return "active";
}

/**
 * Normalises nextDate matching asRecurrenceNextDate in src/models/mappers.ts.
 */
function asRecurrenceNextDate(nextDate, nextExecutionDate, fallback = "") {
  if (typeof nextDate === "string" && nextDate.length > 0) {
    return nextDate;
  }
  if (typeof nextExecutionDate === "string" && nextExecutionDate.length > 0) {
    return nextExecutionDate;
  }
  return fallback;
}

/**
 * Normalises pattern matching asRecurrencePattern in src/models/mappers.ts.
 * Lowercases before checking against allowed list; defaults to "monthly".
 */
function asRecurrencePattern(v) {
  const allowed = ["daily", "weekly", "monthly", "yearly"];
  const normalized = typeof v === "string" ? v.toLowerCase() : "";
  return allowed.includes(normalized) ? normalized : "monthly";
}

/**
 * Validates and computes canonical migration updates for a single legacy document.
 */
function computeMigrationUpdates(docPath, data) {
  const candidateAnchor = asRecurrenceNextDate(data.nextDate, data.nextExecutionDate);
  if (!candidateAnchor || !isValidDate(candidateAnchor)) {
    throw new Error(
      `No resolvable anchor date for "${docPath}". ` +
      `nextDate="${data.nextDate}", nextExecutionDate="${data.nextExecutionDate}". Expected valid YYYY-MM-DD.`
    );
  }

  const status = asRecurrenceStatus(data.status, data.isActive);
  const nextDate = candidateAnchor;
  const pattern = asRecurrencePattern(data.pattern);

  const updates = {
    status,
    nextDate,
    pattern,
    isActive: FieldValue.delete(),
    nextExecutionDate: FieldValue.delete(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  return {
    updates,
    summary: {
      status: `${status}${data.status === undefined ? ` (from isActive: ${data.isActive})` : ""}`,
      nextDate: `${nextDate}${data.nextDate === undefined || data.nextDate === "" ? ` (from nextExecutionDate: "${data.nextExecutionDate}")` : ""}`,
      pattern: `${pattern}${data.pattern !== pattern ? ` (from "${data.pattern}")` : ""}`,
      deletedFields: ["isActive", "nextExecutionDate"].filter((field) => field in data),
    },
  };
}

async function main() {
  const args = process.argv.slice(2);
  const isApply = args.includes("--apply");
  const skipInvalid = args.includes("--skip-invalid");

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
SubTracker Recurrence Backfill
==============================
Scans all user recurrences across Firestore and normalises legacy schema documents
to the canonical schema.

Options:
  --apply          Commit changes to Firestore. Without this flag, runs in dry-run mode.
  --skip-invalid   Skip documents that cannot be normalised (e.g. invalid/missing anchor date)
                   instead of aborting execution.
  --help, -h       Display this help message.
`);
    return;
  }

  console.log("==================================================");
  console.log("SubTracker Legacy Recurrence Backfill");
  console.log(`Execution Mode : ${isApply ? "APPLY (writes enabled)" : "DRY RUN (read-only)"}`);
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    console.log(`Firestore Target: EMULATOR (${process.env.FIRESTORE_EMULATOR_HOST})`);
  } else {
    console.log("Firestore Target: PRODUCTION / REMOTE");
  }
  console.log("==================================================\n");

  console.log("Scanning collectionGroup('recurrences')...");
  const snap = await db.collectionGroup("recurrences").get();

  const totalScanned = snap.docs.length;
  let canonicalCount = 0;
  const legacyToMigrate = [];
  const invalidDocs = [];

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const docPath = docSnap.ref.path;

    if (!isLegacyRecurrenceDoc(data)) {
      canonicalCount++;
      continue;
    }

    try {
      const { updates, summary } = computeMigrationUpdates(docPath, data);
      legacyToMigrate.push({
        ref: docSnap.ref,
        path: docPath,
        updates,
        summary,
      });
    } catch (err) {
      invalidDocs.push({
        ref: docSnap.ref,
        path: docPath,
        error: err.message,
      });
    }
  }

  const legacyCount = legacyToMigrate.length + invalidDocs.length;

  console.log("\nScan Results:");
  console.log(`- Total recurrences scanned: ${totalScanned}`);
  console.log(`- Already canonical:        ${canonicalCount}`);
  console.log(`- Legacy documents found:   ${legacyCount}`);
  if (invalidDocs.length > 0) {
    console.log(`- Unnormalisable documents: ${invalidDocs.length}`);
  }

  // Handle invalid/unnormalisable documents
  if (invalidDocs.length > 0) {
    console.error("\nERROR: Found unnormalisable documents with invalid or missing anchor dates:");
    for (const inv of invalidDocs) {
      console.error(`  - ${inv.path}: ${inv.error}`);
    }

    if (!skipInvalid) {
      console.error("\nFATAL: Aborting backfill to prevent data corruption.");
      console.error("Pass --skip-invalid to skip unnormalisable documents and proceed.\n");
      process.exit(1);
    } else {
      console.warn("\nProceeding because --skip-invalid was specified. Invalid documents will NOT be modified.\n");
    }
  }

  if (legacyToMigrate.length === 0) {
    console.log("\nAll recurrences are already canonical. No updates required.");
    return;
  }

  if (!isApply) {
    console.log("\n--- DRY RUN PREVIEW (First 10 affected documents) ---");
    const sample = legacyToMigrate.slice(0, 10);
    sample.forEach((item, idx) => {
      console.log(`\n[${idx + 1}/${sample.length}] ${item.path}`);
      console.log(`  status:     ${item.summary.status}`);
      console.log(`  nextDate:   ${item.summary.nextDate}`);
      console.log(`  pattern:    ${item.summary.pattern}`);
      console.log(`  deletions:  ${item.summary.deletedFields.length > 0 ? item.summary.deletedFields.join(", ") : "isActive, nextExecutionDate"}`);
      console.log(`  updatedAt:  <FieldValue.serverTimestamp()>`);
    });

    console.log("\n==================================================");
    console.log("Dry run finished. 0 writes were performed.");
    console.log(`To apply updates to ${legacyToMigrate.length} documents, re-run with:`);
    console.log("  node scripts/backfill-recurrences.js --apply");
    if (invalidDocs.length > 0) {
      console.log("  (Add --skip-invalid to bypass the invalid documents)");
    }
    console.log("==================================================");
    return;
  }

  // Apply writes in batches
  console.log(`\nApplying updates to ${legacyToMigrate.length} documents in batches of up to ${BATCH_SIZE}...`);
  const totalBatches = Math.ceil(legacyToMigrate.length / BATCH_SIZE);

  for (let b = 0; b < totalBatches; b++) {
    const batch = db.batch();
    const chunk = legacyToMigrate.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);

    for (const item of chunk) {
      batch.update(item.ref, item.updates);
    }

    console.log(`Committing batch ${b + 1} of ${totalBatches} (${chunk.length} documents)...`);
    await batch.commit();
    console.log(`Batch ${b + 1}/${totalBatches} committed successfully.`);
  }

  console.log("\n==================================================");
  console.log(`Backfill completed successfully. Migrated ${legacyToMigrate.length} documents.`);
  if (invalidDocs.length > 0) {
    console.log(`Skipped ${invalidDocs.length} unnormalisable documents (--skip-invalid).`);
  }
  console.log("==================================================");
}

main().catch((err) => {
  console.error("FATAL ERROR during recurrence backfill execution:", err);
  process.exit(1);
});
