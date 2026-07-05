/** Extracts a human-readable message from an unknown caught value, if any. */
export const getErrorMessage = (err: unknown): string | undefined => {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return undefined;
};

/** Strips Firebase Auth's "Firebase: ... (auth/code)." noise from an error message. */
export const formatAuthErrorMessage = (err: unknown): string | undefined =>
  getErrorMessage(err)
    ?.replace("Firebase: ", "")
    .replace(/\(auth\/.*\)/, "");
