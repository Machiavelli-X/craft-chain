"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type StepResult = {
  success: boolean;
  executedOnChain?: boolean;
  readyForWallet?: boolean;
  transactionHash?: string;
  metadataUri?: string;
  dataHash?: string;
  tokenId?: string;
  explorerUrl?: string;
  message?: string;
  currentOwner?: string;
  contractAddress?: string;
};

export default function RecordStep() {
  const [tokenId, setTokenId] = useState("");
  const [stepType, setStepType] = useState("Processing");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [stepDate, setStepDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<StepResult | null>(null);

  // Set today's date only on client side to avoid hydration mismatch
  useEffect(() => {
    setStepDate(new Date().toLocaleDateString("en-CA"));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!tokenId.trim() || !description.trim() || !location.trim() || !stepDate) {
      setError("Please complete all fields before continuing.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/record-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: tokenId.trim(),
          stepType,
          description: description.trim(),
          location: location.trim(),
          stepDate,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to record step.");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm text-emerald-400 hover:text-emerald-300"
        >
          ← Back to Home
        </Link>

        <p className="mt-8 text-sm font-semibold uppercase tracking-wider text-emerald-400">
          Craft-Chain Traceability
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          Record a Supply Chain Step
        </h1>

        <p className="mt-3 leading-7 text-slate-400">
          Record a custody update, craftsmanship stage, or transportation milestone on Ethereum Sepolia.
        </p>

        {result && result.executedOnChain && (
          <div className="mt-8 rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-2xl font-bold text-emerald-400">
                ✓
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-emerald-300">
                  Step Recorded On-Chain!
                </h3>
                <p className="mt-1 text-sm text-slate-300">
                  Checkpoint proof has been anchored to Sepolia and linked with cryptographic hash verification.
                </p>

                <div className="mt-4 grid gap-2 rounded-lg bg-slate-900/80 p-4 text-xs font-mono text-slate-300 sm:text-sm">
                  <div>
                    <span className="text-slate-500">Batch Token ID:</span>{" "}
                    <span className="font-bold text-emerald-400">#{result.tokenId}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-500">Data Hash (Keccak256):</span>{" "}
                    <span className="text-slate-300">{result.dataHash}</span>
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
                    View Updated Journey for Batch #{result.tokenId} →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {result && result.readyForWallet && (
          <div className="mt-8 rounded-2xl border border-amber-500/40 bg-amber-950/20 p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-2xl text-amber-400">
                ⚠
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-amber-300">
                  Metadata Ready — Submit via Your Wallet
                </h3>
                <p className="mt-1 text-sm text-slate-300">
                  Token <strong>#{result.tokenId}</strong> is owned by a different wallet address.
                  The IPFS proof and cryptographic hash have been generated. You need to call{" "}
                  <code className="rounded bg-slate-800 px-1">recordStep()</code> from the owner&apos;s wallet (e.g. MetaMask).
                </p>

                <div className="mt-4 space-y-2 rounded-lg bg-slate-900/80 p-4 text-xs font-mono text-slate-300">
                  <div>
                    <span className="text-slate-500">Token ID:</span>{" "}
                    <span className="text-amber-300 font-bold">#{result.tokenId}</span>
                  </div>
                  <div className="break-all">
                    <span className="text-slate-500">Contract:</span>{" "}
                    <a
                      href={`https://sepolia.etherscan.io/address/${result.contractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 underline"
                    >
                      {result.contractAddress}
                    </a>
                  </div>
                  <div className="break-all">
                    <span className="text-slate-500">Current Owner:</span>{" "}
                    <span className="text-slate-300">{result.currentOwner}</span>
                  </div>
                  <div className="break-all">
                    <span className="text-slate-500">IPFS Metadata URI:</span>{" "}
                    <span className="text-slate-300">{result.metadataUri}</span>
                  </div>
                  <div className="break-all">
                    <span className="text-slate-500">Data Hash (Keccak256):</span>{" "}
                    <span className="text-slate-300">{result.dataHash}</span>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-amber-800/40 bg-amber-950/30 p-4 text-sm text-amber-200">
                  <p className="font-semibold mb-2">How to submit via MetaMask:</p>
                  <ol className="list-decimal list-inside space-y-1 text-amber-100/80">
                    <li>Open the contract on <a href={`https://sepolia.etherscan.io/address/${result.contractAddress}#writeContract`} target="_blank" rel="noopener noreferrer" className="underline text-amber-300">Sepolia Etherscan ↗</a></li>
                    <li>Connect MetaMask (must be the owner wallet shown above)</li>
                    <li>Call <code className="bg-slate-800 px-1 rounded">recordStep</code> with the Token ID, IPFS URI, and Data Hash above</li>
                  </ol>
                </div>

                <div className="mt-4 text-sm text-slate-400">
                  <strong className="text-slate-300">Tip:</strong> Use Token IDs 2, 3, or 5 — those are owned by the server wallet and will record automatically.
                </div>
              </div>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8"
        >
          <div>
            <label htmlFor="tokenId" className="mb-2 block font-medium">
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
            <label htmlFor="stepType" className="mb-2 block font-medium">
              Step Type <span className="text-emerald-400">*</span>
            </label>
            <select
              id="stepType"
              value={stepType}
              onChange={(event) => setStepType(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
            >
              <option>Processing</option>
              <option>Quality Check</option>
              <option>Packaging</option>
              <option>Transportation</option>
              <option>Received by Co-op</option>
              <option>Received by Retailer</option>
              <option>Delivered to Buyer</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block font-medium">
              Step Description <span className="text-emerald-400">*</span>
            </label>
            <textarea
              id="description"
              required
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe what occurred during this supply chain stage..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="location" className="mb-2 block font-medium">
                Location <span className="text-emerald-400">*</span>
              </label>
              <input
                id="location"
                required
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="e.g. Sambalpur Artisan Co-op"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label htmlFor="stepDate" className="mb-2 block font-medium">
                Step Date <span className="text-emerald-400">*</span>
              </label>
              <input
                id="stepDate"
                type="date"
                required
                value={stepDate}
                onChange={(event) => setStepDate(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
              />
            </div>
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
            className="w-full rounded-lg bg-emerald-500 px-6 py-3.5 font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Recording Step on Ethereum..." : "Record Step On-Chain"}
          </button>
        </form>
      </div>
    </main>
  );
}
