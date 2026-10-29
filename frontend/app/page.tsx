"use client";

import { useState } from "react";
import Link from "next/link";

declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string;
        params?: unknown[];
      }) => Promise<unknown>;
    };
  }
}

const SEPOLIA_CHAIN_ID = "0xaa36a7";
const SEPOLIA_EXPLORER = "https://sepolia.etherscan.io/";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState("");
  const [walletMessage, setWalletMessage] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  async function connectWallet() {
    setWalletMessage("");

    if (typeof window === "undefined" || !window.ethereum) {
      setWalletMessage(
        "MetaMask was not detected. Please install or enable the MetaMask browser extension."
      );
      return;
    }

    setIsConnecting(true);

    try {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (!accounts || accounts.length === 0) {
        setWalletMessage("No wallet account was selected.");
        return;
      }

      setWalletAddress(accounts[0]);

      const chainId = (await window.ethereum.request({
        method: "eth_chainId",
      })) as string;

      if (chainId.toLowerCase() !== SEPOLIA_CHAIN_ID) {
        setWalletMessage(
          "Wallet connected, but you are not on Sepolia Testnet. Use the network switch option below."
        );
      } else {
        setWalletMessage("Wallet connected successfully on Sepolia Testnet.");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to connect your wallet.";

      setWalletMessage(
        message.includes("4001")
          ? "Wallet connection was rejected. You can try again."
          : message
      );
    } finally {
      setIsConnecting(false);
    }
  }

  async function switchToSepolia() {
    if (!window.ethereum) {
      setWalletMessage("Please install or enable MetaMask first.");
      return;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });

      const accounts = (await window.ethereum.request({
        method: "eth_accounts",
      })) as string[];

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }

      setWalletMessage("Switched to Sepolia Testnet successfully.");
    } catch (error) {
      const walletError = error as { code?: number };

      if (walletError.code === 4902) {
        setWalletMessage(
          "Sepolia is not configured in MetaMask. Enable test networks in MetaMask and add Sepolia, then try again."
        );
      } else if (walletError.code === 4001) {
        setWalletMessage("Network switch was rejected in MetaMask.");
      } else {
        setWalletMessage(
          "Could not switch networks. Please check MetaMask and try again."
        );
      }
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-6 py-5">
          <Link href="/" className="shrink-0">
            <h1 className="text-2xl font-bold text-emerald-400">
              Craft-Chain
            </h1>
            <p className="text-xs text-slate-400">Product Traceability</p>
          </Link>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
            <Link href="/" className="font-medium text-emerald-400">
              Home
            </Link>
            <Link
              href="/mint"
              className="text-slate-300 transition hover:text-emerald-400"
            >
              Mint Batch
            </Link>
            <Link
              href="/record-step"
              className="text-slate-300 transition hover:text-emerald-400"
            >
              Record Step
            </Link>
            <Link
              href="/transfer"
              className="text-slate-300 transition hover:text-emerald-400"
            >
              Transfer
            </Link>
            <Link
              href="/verify"
              className="text-slate-300 transition hover:text-emerald-400"
            >
              Verify Batch
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={SEPOLIA_EXPLORER}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-emerald-500/40 px-4 py-2 text-sm font-medium text-emerald-400 transition hover:border-emerald-400 hover:bg-slate-900"
            >
              Sepolia Testnet ↗
            </a>

            <button
              type="button"
              onClick={connectWallet}
              disabled={isConnecting}
              className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isConnecting
                ? "Connecting..."
                : walletAddress
                  ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                  : "Connect Wallet"}
            </button>
          </div>
        </div>

        {walletAddress && (
          <div className="mx-auto max-w-7xl px-6 pb-4 text-sm text-slate-400">
            Connected wallet:{" "}
            <span className="break-all text-emerald-400">
              {walletAddress}
            </span>
          </div>
        )}

        {walletMessage && (
          <div
            role="status"
            aria-live="polite"
            className="mx-auto max-w-7xl space-y-3 px-6 pb-4 text-sm text-slate-300"
          >
            <p>{walletMessage}</p>
            {walletAddress && (
              <button
                type="button"
                onClick={switchToSepolia}
                className="rounded-lg border border-emerald-500/40 px-4 py-2 text-emerald-400 transition hover:bg-slate-900"
              >
                Switch to Sepolia
              </button>
            )}
          </div>
        )}
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-400">
            Blockchain-Powered Traceability
          </p>

          <h2 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Track every craft product{" "}
            <span className="text-emerald-400">
              from artisan to buyer.
            </span>
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Craft-Chain provides end-to-end traceability for handcrafted products on Ethereum Sepolia.
            Each batch gets a unique NFT identity. Custodianship hand-offs and production steps
            are cryptographically anchored to the blockchain and verifiable by anyone.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/verify"
              className="rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Start Tracking
            </Link>

            <Link
              href="/mint"
              className="rounded-lg border border-slate-700 px-6 py-3 font-semibold text-white transition hover:border-emerald-500 hover:bg-slate-900"
            >
              Mint New Batch
            </Link>
          </div>

          <p className="mt-5 text-xs text-slate-500">
            Academic project demonstration · Ethereum Sepolia testnet
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
            Batch Lookup
          </p>

          <h3 className="mt-2 text-2xl font-bold">Trace a Craft Batch</h3>

          <p className="mt-2 text-slate-400">
            Enter a batch Token ID on the verification page to prepare to
            inspect product details and supply-chain history.
          </p>

          <div className="mt-6">
            <Link
              href="/verify"
              className="inline-flex rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              View Batch
            </Link>
          </div>
        </div>
      </section>

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
          <Link
            href="/mint"
            className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-emerald-500"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-2xl text-emerald-400">
              +
            </div>
            <h4 className="text-xl font-bold text-emerald-400">Mint Batch</h4>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Enter product name, origin, material, description, and
              production date for a new craft batch.
            </p>
            <p className="mt-5 text-sm font-semibold text-white group-hover:text-emerald-400">
              Open Mint Page →
            </p>
          </Link>

          <Link
            href="/record-step"
            className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-emerald-500"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-2xl text-emerald-400">
              ↗
            </div>
            <h4 className="text-xl font-bold text-emerald-400">Record Steps</h4>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Write processing, transportation, and custody events permanently
              on-chain with IPFS metadata and Keccak-256 hash verification.
            </p>
            <p className="mt-5 text-sm font-semibold text-white group-hover:text-emerald-400">
              Record a Step →
            </p>
          </Link>

          <Link
            href="/transfer"
            className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-emerald-500"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-2xl text-emerald-400">
              ⇄
            </div>
            <h4 className="text-xl font-bold text-emerald-400">Transfer Batch</h4>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Transfer ERC721 token ownership to the co-op, retailer, or buyer
              with on-chain safeTransferFrom confirmation.
            </p>
            <p className="mt-5 text-sm font-semibold text-white group-hover:text-emerald-400">
              Transfer Ownership →
            </p>
          </Link>

          <Link
            href="/verify"
            className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-emerald-500"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-2xl text-emerald-400">
              ✓
            </div>
            <h4 className="text-xl font-bold text-emerald-400">Verify History</h4>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Enter any batch Token ID to view its live ownership, full checkpoint
              journey, and IPFS cryptographic verification status.
            </p>
            <p className="mt-5 text-sm font-semibold text-white group-hover:text-emerald-400">
              Verify Batch →
            </p>
          </Link>
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
            Supply Chain
          </p>
          <h3 className="mt-2 text-3xl font-bold">From artisan to buyer</h3>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                number: "01",
                title: "Create",
                description: "Mint a new NFT for your craft batch. Metadata is stored on IPFS and anchored on Sepolia.",
              },
              {
                number: "02",
                title: "Record",
                description: "Write supply-chain events on-chain. Each step is cryptographically hashed for tamper-proof integrity.",
              },
              {
                number: "03",
                title: "Transfer",
                description: "Transfer ERC721 token custody on-chain as the batch moves between artisan, co-op, and retailer.",
              },
              {
                number: "04",
                title: "Verify",
                description: "Lookup any Batch Token ID to view its full supply-chain journey and cryptographic checkpoint status.",
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

      <footer className="border-t border-slate-800 px-6 py-8 text-center">
        <p className="font-semibold text-emerald-400">Craft-Chain</p>
        <p className="mt-2 text-sm text-slate-500">
          Blockchain-Based Craft Product Traceability
        </p>
        <p className="mt-2 text-xs text-slate-600">
          Powered by Ethereum Sepolia Testnet &amp; IPFS cryptographic checkpoints.
        </p>
      </footer>
    </main>
  );
}
