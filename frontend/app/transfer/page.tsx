"use client";

import { useState } from "react";

export default function TransferBatch() {
  const [tokenId, setTokenId] = useState("");
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!tokenId.trim() || !recipient.trim()) {
      setMessage("Please enter both the Batch Token ID and recipient address.");
      return;
    }

    if (!/^(0x)?[0-9a-fA-F]{40}$/.test(recipient.trim())) {
      setMessage("Please enter a valid Ethereum wallet address.");
      return;
    }

    setMessage(
      "Details validated successfully. Blockchain transfer will be connected during integration."
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">
        <a href="/" className="text-sm font-medium text-emerald-400 hover:text-emerald-300">
          ← Back to Home
        </a>

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
            Craft-Chain Traceability
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Transfer Batch Ownership
          </h1>
          <p className="mt-3 text-slate-400">
            Transfer custody of a craft product batch to its next supply-chain participant.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl sm:p-8"
        >
          <div>
            <label htmlFor="tokenId" className="mb-2 block text-sm font-medium">
              Batch Token ID <span className="text-emerald-400">*</span>
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

          <div>
            <label htmlFor="recipient" className="mb-2 block text-sm font-medium">
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
              Enter the recipient's public Ethereum wallet address. Never enter a seed phrase or private key.
            </p>
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
            Validate Transfer Details
          </button>

          <p className="border-t border-slate-800 pt-4 text-xs leading-5 text-slate-500">
            Frontend demonstration only. This form validates the details but does not transfer NFT ownership until connected to the smart contract.
          </p>
        </form>
      </div>
    </main>
  );
}