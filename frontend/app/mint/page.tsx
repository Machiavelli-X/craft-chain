"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

export default function MintBatch() {
  const [form, setForm] = useState({
    productName: "",
    description: "",
    origin: "",
    material: "",
    productionDate: "",
  });

  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const today = new Date().toLocaleDateString("en-CA");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (form.productionDate > today) {
      setSubmitted(false);
      setMessage("Production date cannot be in the future.");
      return;
    }

    setSubmitted(true);
    setMessage(
      "Form validated successfully. Your details are ready for integration with IPFS and the smart contract."
    );
  }

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({ ...previous, [name]: value }));
    setMessage("");
    setSubmitted(false);
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
            Add your craft product details to prepare a new traceable batch.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-8">
          <div className="mb-7 border-b border-slate-800 pb-5">
            <h2 className="text-xl font-semibold">Product Information</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Enter accurate details about the product and its production.
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
                placeholder="e.g. Handwoven Cotton Saree"
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
                placeholder="Describe the craft product, its design and features..."
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
                  placeholder="e.g. Odisha, India"
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
                  placeholder="e.g. Cotton, Silk, Bamboo"
                  className={fieldClass}
                />
              </div>
            </div>

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

            {message && (
              <div
                role="status"
                aria-live="polite"
                className={`rounded-lg border p-4 text-sm leading-6 ${
                  submitted
                    ? "border-emerald-700 bg-emerald-950/40 text-emerald-300"
                    : "border-amber-700 bg-amber-950/30 text-amber-300"
                }`}
              >
                {message}
              </div>
            )}

            <div className="border-t border-slate-800 pt-6">
              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-500 px-5 py-3.5 font-semibold text-slate-950 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-slate-900 sm:w-auto"
              >
                Validate Batch Details
              </button>

              <p className="mt-4 text-xs leading-5 text-slate-500">
                Frontend demonstration only. This form does not upload
                metadata to IPFS or mint an NFT on the blockchain yet.
              </p>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
