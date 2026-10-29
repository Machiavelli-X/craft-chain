"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "50px 20px",
        backgroundColor: "#e5e7eb",
        fontFamily: "Arial, sans-serif",
        color: "#111827",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          width: "100%",
          backgroundColor: "#ffffff",
          padding: "40px",
          borderRadius: "18px",
          border: "1px solid #d1d5db",
          boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "70px",
            height: "70px",
            margin: "0 auto 15px",
            borderRadius: "50%",
            backgroundColor: "#fef3c7",
            color: "#d97706",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "40px",
            fontWeight: "bold",
          }}
        >
          !
        </div>

        <h1
          style={{
            fontSize: "30px",
            marginBottom: "10px",
          }}
        >
          Unable to Verify
        </h1>

        <p
          style={{
            color: "#4b5563",
            fontSize: "17px",
            lineHeight: "1.6",
          }}
        >
          We couldn&apos;t verify this craft product right now.
          Please try again in a moment.
        </p>

        <button
          onClick={() => reset()}
          style={{
            marginTop: "20px",
            padding: "11px 20px",
            backgroundColor: "#111827",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "15px",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>

        <Link
          href="/verify"
          style={{
            display: "block",
            marginTop: "15px",
            color: "#374151",
            textDecoration: "underline",
          }}
        >
          Back to Verification
        </Link>
      </div>
    </main>
  );
}