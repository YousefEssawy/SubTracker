import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["tests/emulator/**/*.test.ts"],
    testTimeout: 20000,
    // Emulator tests share a single live Firestore emulator instance and a shared
    // test environment singleton. Test files must run sequentially so that one
    // file's beforeEach clearAllData() does not wipe documents seeded by another.
    fileParallelism: false,
  },
});
