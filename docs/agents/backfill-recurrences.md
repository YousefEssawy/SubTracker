# Recurrence Schema Backfill

This document describes the one-off operator migration script (`scripts/backfill-recurrences.js`) for permanently upgrading legacy Recurrence documents in Firestore to the canonical TypeScript schema.

## Purpose

Earlier versions of the client stored Recurrences with:
- `isActive: boolean` instead of `status: "active" | "paused" | "completed"`
- `nextExecutionDate: string` instead of `nextDate: string`
- Capitalised patterns (e.g. `"Weekly"`, `"Monthly"`, `"Yearly"`, `"Custom"`)

The client currently normalises these documents on read via `toRecurrence` in `src/models/mappers.ts` and flags them with `isLegacySchema`. To permanently remove dependency on read-time normalisation, `scripts/backfill-recurrences.js` converts all legacy Recurrence documents to the canonical format and deletes obsolete fields.

## Credentials and Target Environments

The script uses `firebase-admin` (resolved from `functions/node_modules/` without root dependency modification).

### Production
Supply credentials via `GOOGLE_APPLICATION_CREDENTIALS`:
