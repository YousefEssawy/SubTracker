# Firebase Emulator Test Harness

This document describes how to run and maintain the Firebase emulator test suite for SubTracker.

## Prerequisites

- **Java JDK 11 or higher**: The Firestore emulator is a **Java process** run by `firebase-tools`.
- **Java on PATH**: Even when a JDK is installed, `java` might not be present on system `PATH`.
  - On Windows development environments with Android Studio installed, `JAVA_HOME` typically points at the bundled JetBrains Runtime (OpenJDK 21) at:
    `C:\Program Files\Android\Android Studio\jbr`
  - In PowerShell, ensure Java is available before running the emulator:
    ```powershell
    $env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
    ```
  - In bash:
    ```bash
    export PATH="$JAVA_HOME/bin:$PATH"
    ```

## Why emulator tests do not run as part of `npm run test`

Unit tests executed via `npm run test` must remain fast, lightweight, and runnable in any environment without requiring an external Java runtime or active background processes.

The emulator suite requires a live Java emulator process (`firebase-tools`) and performs actual network round-trips against emulated services. Therefore, `tests/emulator/**` is explicitly excluded from `vite.config.js` and managed with a separate Vitest configuration (`vitest.emulator.config.ts`). A developer without a JDK can run `npm run test` without errors.

## Running Tests

### 1. One-shot execution (CI mode)
Starts the emulators, executes the emulator test suite, and shuts down the emulators automatically:
