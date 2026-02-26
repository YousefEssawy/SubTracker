# Quickstart: TypeScript UI Migration

## Local Development (Testing the Fixes)

1. Ensure all packages are installed:

   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   _The server should now launch successfully without any "Failed to load url ... .js" terminal errors._

## Validating Types

Run the strict type checker across all `.ts` and `.tsx` files:

```bash
npm run typecheck
```

_Expected output: Exit code 0, no errors printed._

## Building for Production

Verify the production build succeeds and properly strips all TypeScript annotations:

```bash
npm run build
```
