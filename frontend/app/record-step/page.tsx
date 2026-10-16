"use client";

import { useState } from "react";

export default function RecordStep() {
  const [tokenId, setTokenId] = useState("");
  const [stepType, setStepType] = useState("Processing");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [stepDate, setStepDate] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!tokenId.trim() || !description.trim() || !location.trim() || !stepDate) {
      setMessage("Please complete all fields before continuing.");
      return;
    }

    setMessage(
      "Form validated successfully. Blockchain recording will be enabled when the smart contract is connected."
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <a
          href="/"
          className="text-sm text-emerald-400 hover:text-emerald-300"
        >
          ← Back to Home
        </a>

        <p className="mt-8 text-sm font-semibold uppercase tracking-wider text-emerald-400">
          Craft-Chain Traceability
        </p>

        <h1 className="mt-3 text-4xl font-bold">Record a Supply Chain Step</h1>

        <p className="mt-3 leading-7 text-slate-400">
          Add a processing, transportation, or custody update to a craft batch.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8"
        >
          <div>
            <label htmlFor="tokenId" className="mb-2 block font-medium">
              Batch Token ID
            </label>
            <input
              id="tokenId"
              type="number"
              min="0"
              required
              value={tokenId}
              onChange={(event) => setTokenId(event.target.value)}
              placeholder="Enter the batch Token ID"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label htmlFor="stepType" className="mb-2 block font-medium">
              Step Type
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
              Step Description
            </label>
            <textarea
              id="description"
              required
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe what happened to this batch"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label htmlFor="location" className="mb-2 block font-medium">
              Location
            </label>
            <input
              id="location"
              required
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Enter processing or transfer location"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label htmlFor="stepDate" className="mb-2 block font-medium">
              Step Date
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

          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Validate Step Details
          </button>

          {message && (
            <p
              role="status"
              className="rounded-lg border border-slate-700 bg-slate-950 p-4 text-sm leading-6 text-slate-300"
            >
              {message}
            </p>
          )}
        </form>

        <p className="mt-5 text-sm leading-6 text-slate-500">
          Demo stage: this form validates the details locally. It does not yet
          write to the blockchain. On-chain recording will be connected after
          the smart contract address and ABI are available.
        </p>
      </div>
    </main>
  );
}