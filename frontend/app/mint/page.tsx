"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

type MintSuccess = {
  tokenId: string;
  transactionHash: string;
  metadataUri: string;
  cid: string;
  recipient: string;
  explorerUrl: string;
};

export default function MintBatch() {
  const [form, setForm] = useState({
    productName: "",
    description: "",
    origin: "",
    material: "",
    productionDate: "",
    recipientAddress: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mintResult, setMintResult] = useState<MintSuccess | null>(null);

  const today = new Date().toLocaleDateString("en-CA");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMintResult(null);

    if (form.productionDate > today) {
      setError("Production date cannot be in the future.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to mint craft batch.");
      }

      setMintResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
  }

  const fieldClass =
    "mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20";

  const labelClass = "block text-sm font-medium text-slate-200";

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-emerald-400 transition hover:text-emerald-300"
        >
          <span aria-hidden="true">←</span> Back to Home
        </Link>

        <header className="mb-8 mt-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-emerald-400">
            Craft-Chain Traceability
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Mint New Craft Batch
          </h1>

          <p className="mt-3 leading-7 text-slate-400">
            Register your craft product to generate a unique on-chain NFT and IPFS metadata.
          </p>
        </header>

        {mintResult && (
          <div className="mb-8 rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-2xl font-bold text-emerald-400">
                ✓
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-emerald-300">
                  Batch Successfully Minted On-Chain!
                </h3>
                <p className="mt-1 text-sm text-slate-300">
                  Your batch has been recorded on Ethereum Sepolia and metadata pinned to IPFS.
                </p>

                <div className="mt-4 grid gap-2 rounded-lg bg-slate-900/80 p-4 text-xs font-mono text-slate-300 sm:text-sm">
                  <div>
                    <span className="text-slate-500">Batch Token ID:</span>{" "}
                    <span className="font-bold text-emerald-400">#{mintResult.tokenId}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-500">IPFS URI:</span>{" "}
                    <span className="text-slate-300">{mintResult.metadataUri}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-500">Tx Hash:</span>{" "}
                    <a
                      href={mintResult.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 underline hover:text-emerald-300"
                    >
                      {mintResult.transactionHash} ↗
                    </a>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/verify/${mintResult.tokenId}`}
                    className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                  >
                    View & Verify Batch #{mintResult.tokenId} →
                  </Link>
                  <Link
                    href="/record-step"
                    className="rounded-lg border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-emerald-500 hover:text-emerald-400"
                  >
                    Record Supply Chain Step →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-8">
          <div className="mb-7 border-b border-slate-800 pb-5">
            <h2 className="text-xl font-semibold">Product Information</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Enter accurate details about the craft product and its production.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="productName" className={labelClass}>
                Product Name <span className="text-emerald-400">*</span>
              </label>
              <input
                id="productName"
                name="productName"
                type="text"
                required
                maxLength={100}
                value={form.productName}
                onChange={handleChange}
                placeholder="e.g. Handwoven Sambalpuri Cotton Saree"
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>
                Description <span className="text-emerald-400">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                maxLength={1000}
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the craft product, its design, weave style, and features..."
                className={fieldClass}
              />
              <p className="mt-2 text-right text-xs text-slate-500">
                {form.description.length}/1000 characters
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="origin" className={labelClass}>
                  Origin <span className="text-emerald-400">*</span>
                </label>
                <input
                  id="origin"
                  name="origin"
                  type="text"
                  required
                  maxLength={150}
                  value={form.origin}
                  onChange={handleChange}
                  placeholder="e.g. Sambalpur, Odisha, India"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="material" className={labelClass}>
                  Material <span className="text-emerald-400">*</span>
                </label>
                <input
                  id="material"
                  name="material"
                  type="text"
                  required
                  maxLength={150}
                  value={form.material}
                  onChange={handleChange}
                  placeholder="e.g. 100% Organic Handspun Cotton"
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="productionDate" className={labelClass}>
                  Production Date <span className="text-emerald-400">*</span>
                </label>
                <input
                  id="productionDate"
                  name="productionDate"
                  type="date"
                  required
                  max={today}
                  value={form.productionDate}
                  onChange={handleChange}
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="recipientAddress" className={labelClass}>
                  Recipient Wallet Address (Optional)
                </label>
                <input
                  id="recipientAddress"
                  name="recipientAddress"
                  type="text"
                  value={form.recipientAddress}
                  onChange={handleChange}
                  placeholder="Defaults to admin wallet if blank"
                  className={fieldClass}
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

            <div className="border-t border-slate-800 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-emerald-500 px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {loading ? "Minting on Sepolia Testnet..." : "Mint Batch NFT"}
              </button>

              <p className="mt-4 text-xs leading-5 text-slate-500">
                Connected to Ethereum Sepolia Testnet. Uploads metadata to IPFS and mints an authentic ERC721 NFT token.
              </p>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
