"use client";

import { useState } from "react";

export default function VerifyBatch() {
  const [tokenId, setTokenId] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!tokenId.trim() || !/^\d+$/.test(tokenId.trim())) {
      setMessage("Please enter a valid non-negative integer Token ID.");
      return;
    }

    setMessage(
      `Token ID ${tokenId.trim()} has been entered successfully. Blockchain verification will be available after smart contract integration.`
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">
        <a
          href="/"
          className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
        >
          ← Back to Home
        </a>

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
            Craft-Chain Traceability
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Verify Craft Batch
          </h1>
          <p className="mt-3 text-slate-400">
            Enter a batch Token ID to prepare to inspect its product details
            and supply-chain history.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl sm:p-8"
        >
          <div>
            <label
              htmlFor="tokenId"
              className="mb-2 block text-sm font-medium"
            >
              Batch Token ID *
            </label>
            <input
              id="tokenId"
              type="number"
              min="0"
              step="1"
              required
              value={tokenId}
              onChange={(event) => setTokenId(event.target.value)}
              placeholder="e.g. 1"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
            />
          </div>

          {message && (
            <div
              role="status"
              className="rounded-lg border border-emerald-800 bg-emerald-950/50 p-4 text-sm text-emerald-300"
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Validate Token ID
          </button>

          <p className="border-t border-slate-800 pt-4 text-xs leading-5 text-slate-500">
            Frontend demonstration only. Actual NFT ownership, metadata, and
            transaction history require smart contract and data integration.
          </p>
        </form>
      </div>
    </main>
  );
}
