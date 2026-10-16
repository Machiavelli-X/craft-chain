
export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-6 py-5">
          <a href="/" className="shrink-0">
            <h1 className="text-2xl font-bold text-emerald-400">
              Craft-Chain
            </h1>
            <p className="text-xs text-slate-400">
              Product Traceability
            </p>
          </a>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
            <a href="/" className="font-medium text-emerald-400">
              Home
            </a>
            <a
              href="/mint"
              className="text-slate-300 transition hover:text-emerald-400"
            >
              Mint Batch
            </a>
            <a
              href="/record-step"
              className="text-slate-300 transition hover:text-emerald-400"
            >
              Record Step
            </a>
            <a
              href="/transfer"
              className="text-slate-300 transition hover:text-emerald-400"
            >
              Transfer
            </a>
            <a
              href="/verify"
              className="text-slate-300 transition hover:text-emerald-400"
            >
              Verify Batch
            </a>
          </div>

          <span className="rounded-lg border border-emerald-500/40 px-4 py-2 text-sm font-medium text-emerald-400">
            Sepolia Testnet
          </span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-400">
            Blockchain-Powered Traceability
          </p>

          <h2 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Track every craft product
            <span className="text-emerald-400">
              {" "}from artisan to buyer.
            </span>
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Craft-Chain helps track the journey of craft products through
            the supply chain. Each batch can have a unique blockchain
            identity, with product details and custody history available
            for verification after integration.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/verify"
              className="rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Start Tracking
            </a>

            <a
              href="/mint"
              className="rounded-lg border border-slate-700 px-6 py-3 font-semibold text-white transition hover:border-emerald-500 hover:bg-slate-900"
            >
              Mint New Batch
            </a>
          </div>

          <p className="mt-5 text-xs text-slate-500">
            Academic project demonstration · Ethereum Sepolia testnet
          </p>
        </div>
      </section>

      {/* Trace Batch */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
            Batch Lookup
          </p>

          <h3 className="mt-2 text-2xl font-bold">
            Trace a Craft Batch
          </h3>

          <p className="mt-2 text-slate-400">
            Open the verification page to enter a batch Token ID and prepare
            to inspect its product details and supply-chain history.
          </p>

          <div className="mt-6">
            <a
              href="/verify"
              className="inline-flex rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              View Batch
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
            Platform Features
          </p>
          <h3 className="mt-2 text-3xl font-bold">
            Manage the product journey
          </h3>
          <p className="mt-3 max-w-2xl text-slate-400">
            Navigate the main stages of craft-product traceability from
            batch creation to supply-chain verification.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Mint Batch Card */}
          <a
            href="/mint"
            className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-emerald-500"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-2xl text-emerald-400">
              +
            </div>
            <h4 className="text-xl font-bold text-emerald-400">
              Mint Batch
            </h4>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Enter product name, origin, material, description, and
              production date for a new craft batch.
            </p>
            <p className="mt-5 text-sm font-semibold text-white group-hover:text-emerald-400">
              Open Mint Page →
            </p>
          </a>

          {/* Record Step Card */}
          <a
            href="/record-step"
            className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-emerald-500"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-2xl text-emerald-400">
              ↗
            </div>
            <h4 className="text-xl font-bold text-emerald-400">
              Record Steps
            </h4>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Prepare processing, transportation, and other supply-chain
              event details for a batch.
            </p>
            <p className="mt-5 text-sm font-semibold text-white group-hover:text-emerald-400">
              Record a Step →
            </p>
          </a>

          {/* Transfer Batch Card */}
          <a
            href="/transfer"
            className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-emerald-500"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-2xl text-emerald-400">
              ⇄
            </div>
            <h4 className="text-xl font-bold text-emerald-400">
              Transfer Batch
            </h4>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Prepare a custody transfer by entering a batch Token ID and
              the recipient's public wallet address.
            </p>
            <p className="mt-5 text-sm font-semibold text-white group-hover:text-emerald-400">
              Transfer Ownership →
            </p>
          </a>

          {/* Verify Batch Card */}
          <a
            href="/verify"
            className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-emerald-500"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-2xl text-emerald-400">
              ✓
            </div>
            <h4 className="text-xl font-bold text-emerald-400">
              Verify History
            </h4>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Enter a batch Token ID to prepare for checking product
              information and custody history.
            </p>
            <p className="mt-5 text-sm font-semibold text-white group-hover:text-emerald-400">
              Verify Batch →
            </p>
          </a>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
            Supply Chain
          </p>
          <h3 className="mt-2 text-3xl font-bold">
            From artisan to buyer
          </h3>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                number: "01",
                title: "Create",
                description: "Prepare the craft batch details.",
              },
              {
                number: "02",
                title: "Record",
                description: "Prepare supply-chain event details.",
              },
              {
                number: "03",
                title: "Transfer",
                description: "Prepare custody handover details.",
              },
              {
                number: "04",
                title: "Verify",
                description: "Look up a batch by its Token ID.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="rounded-xl border border-slate-800 bg-slate-900 p-5"
              >
                <p className="text-sm font-bold text-emerald-400">
                  {step.number}
                </p>
                <h4 className="mt-3 text-lg font-semibold">{step.title}</h4>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-8 text-center">
        <p className="font-semibold text-emerald-400">Craft-Chain</p>
        <p className="mt-2 text-sm text-slate-500">
          Blockchain-Based Craft Product Traceability
        </p>
        <p className="mt-2 text-xs text-slate-600">
          Frontend demonstration. Blockchain and IPFS functionality requires
          integration with the project services.
        </p>
      </footer>
    </main>
  );
}
