import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
  type RulesTestContext,
  type TokenOptions,
} from "@firebase/rules-unit-testing";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PROJECT_ID = "subtracker-test";

let testEnv: RulesTestEnvironment | undefined;

export async function setupTestEnvironment(): Promise<RulesTestEnvironment> {
  if (testEnv) {
    return testEnv;
  }

  const firestoreRulesPath = path.resolve(__dirname, "../../firestore.rules");
  const storageRulesPath = path.resolve(__dirname, "../../storage.rules");

  const firestoreRules = readFileSync(firestoreRulesPath, "utf8");
  const storageRules = readFileSync(storageRulesPath, "utf8");

  const [firestoreHost, firestorePort] = process.env.FIRESTORE_EMULATOR_HOST
    ? process.env.FIRESTORE_EMULATOR_HOST.split(":")
    : ["127.0.0.1", "8080"];
  const [storageHost, storagePort] = process.env.FIREBASE_STORAGE_EMULATOR_HOST
    ? process.env.FIREBASE_STORAGE_EMULATOR_HOST.split(":")
    : ["127.0.0.1", "9199"];

  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      host: firestoreHost,
      port: Number(firestorePort),
      rules: firestoreRules,
    },
    storage: {
      host: storageHost,
      port: Number(storagePort),
      rules: storageRules,
    },
  });

  return testEnv;
}

export function getTestEnv(): RulesTestEnvironment {
  if (!testEnv) {
    throw new Error(
      "Test environment is not initialized. Call setupTestEnvironment() first."
    );
  }
  return testEnv;
}

export function authedAs(
  uid: string,
  tokenOptions?: TokenOptions
): RulesTestContext {
  return getTestEnv().authenticatedContext(uid, tokenOptions);
}

export function unauthed(): RulesTestContext {
  return getTestEnv().unauthenticatedContext();
}

export const unauthenticated = unauthed;

export async function clearAllData(): Promise<void> {
  const env = getTestEnv();
  await Promise.all([env.clearFirestore(), env.clearStorage()]);
}

export const clearData = clearAllData;

export async function withRulesDisabled(
  callback: (context: RulesTestContext) => Promise<void>
): Promise<void> {
  const env = getTestEnv();
  return env.withSecurityRulesDisabled(callback);
}

export const withSecurityRulesDisabled = withRulesDisabled;

export async function seedDocument(
  docPath: string,
  data: Record<string, unknown>
): Promise<void> {
  await withRulesDisabled(async (context) => {
    await context.firestore().doc(docPath).set(data);
  });
}

export async function teardownTestEnvironment(): Promise<void> {
  if (testEnv) {
    await testEnv.cleanup();
    testEnv = undefined;
  }
}

export { assertFails, assertSucceeds };
