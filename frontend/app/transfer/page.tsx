"use client";

import { useState } from "react";
import Link from "next/link";

type TransferResult = {
  success: boolean;
  executedOnChain?: boolean;
  transactionHash?: string;
  from?: string;
  to?: string;
  tokenId?: string;
  explorerUrl?: string;
  message?: string;
};

export default function TransferBatch() {
  const [tokenId, setTokenId] = useState("");
  const [recipient, setRecipient] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TransferResult | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!tokenId.trim() || !recipient.trim()) {
      setError("Please enter both the Batch Token ID and recipient address.");
      return;
    }

    if (!/^0x[0-9a-fA-F]{40}$/.test(recipient.trim())) {
      setError("Please enter a valid 42-character Ethereum wallet address (starting with 0x).");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: tokenId.trim(),
          recipient: recipient.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to execute transfer.");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
        >
          ← Back to Home
        </Link>

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
            Craft-Chain Traceability
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Transfer Batch Ownership
          </h1>

          <p className="mt-3 text-slate-400">
            Transfer on-chain custody of a craft product batch to its next supply-chain participant.
          </p>
        </div>

        {result && result.executedOnChain && (
          <div className="mt-8 rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-2xl font-bold text-emerald-400">
                ✓
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-emerald-300">
                  Custody Transferred On-Chain!
                </h3>
                <p className="mt-1 text-sm text-slate-300">
                  ERC721 safeTransferFrom was successfully confirmed on Sepolia.
                </p>

                <div className="mt-4 grid gap-2 rounded-lg bg-slate-900/80 p-4 text-xs font-mono text-slate-300 sm:text-sm">
                  <div>
                    <span className="text-slate-500">Batch Token ID:</span>{" "}
                    <span className="font-bold text-emerald-400">#{result.tokenId}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-500">New Custodian / Owner:</span>{" "}
                    <span className="text-emerald-300">{result.to}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-500">Tx Hash:</span>{" "}
                    <a
                      href={result.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 underline hover:text-emerald-300"
                    >
                      {result.transactionHash} ↗
                    </a>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/verify/${result.tokenId}`}
                    className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                  >
                    View Batch #{result.tokenId} Ownership →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl sm:p-8"
        >
          <div>
            <label
              htmlFor="tokenId"
              className="mb-2 block text-sm font-medium"
            >
              Batch Token ID <span className="text-emerald-400">*</span>
            </label>

            <input
              id="tokenId"
              type="number"
              min="1"
              required
              value={tokenId}
              onChange={(event) => setTokenId(event.target.value)}
              placeholder="e.g. 1"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label
              htmlFor="recipient"
              className="mb-2 block text-sm font-medium"
            >
              Recipient Wallet Address <span className="text-emerald-400">*</span>
            </label>

            <input
              id="recipient"
              type="text"
              required
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              placeholder="0x..."
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-sm outline-none focus:border-emerald-400"
            />

            <p className="mt-2 text-xs text-slate-500">
              Enter the recipient&apos;s public Ethereum wallet address (e.g. cooperative or retailer).
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-800 bg-red-950/40 p-4 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-500 px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Transferring on Ethereum Sepolia..." : "Transfer Ownership On-Chain"}
          </button>
        </form>
      </div>
    </main>
  );
}
