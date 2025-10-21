"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error somewhere (Sentry, console, etc.)
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
      <p className="text-muted-foreground mb-6">
        We hit a server error while processing your request.
      </p>
      <p className="text-sm text-slate-600 mt-2">
        {error.digest ? `Digest: ${error.digest}` : null}
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">
        Try Again
      </button>
    </main>
  );
}
