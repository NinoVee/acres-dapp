"use client";

import dynamic from "next/dynamic";
import { useWallet } from "@solana/wallet-adapter-react";

import Balances from "../components/Balances";
import TransferSol from "../components/TransferSol";
import TransferAcres2022 from "../components/TransferAcres2022";
import SwapJupiter from "../components/SwapJupiter";
import MassTransfer from "../components/MassTransfer";

const WalletButton = dynamic(() => import("../components/WalletButton"), {
  ssr: false,
});

export default function Page() {
  const wallet = useWallet(); // ✅ REQUIRED

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">$ACRES ↔ SOL dApp</h1>
        <WalletButton />
      </div>

      <p className="mt-3 text-sm text-zinc-300">
        Transfers are Token‑2022 compatible. Swaps use Jupiter.  
        Mass transfers use a CSV file with minimal gas fees.
      </p>

      <div className="mt-6 grid gap-6">
        <Balances />

        <div className="grid gap-6 md:grid-cols-2">
          <TransferSol />
          <TransferAcres2022 />
        </div>

        <SwapJupiter />

        {/* 🔁 MASS TRANSFER */}
        <div className="mt-8 border border-neon p-4 rounded-xl shadow-neon-glow">
          <h2 className="text-xl font-bold mb-2 text-accent">
            $ACRES Mass Transfer
          </h2>
          <p className="text-sm text-zinc-400 mb-4">
            Upload a .csv file exported from SolScan (or any formatted sheet) to
            bulk send $ACRES to multiple wallet addresses.
          </p>

          {/* ✅ PASS WALLET PROP */}
          <MassTransfer wallet={wallet} />
        </div>
      </div>

      <footer className="mt-10 text-xs text-zinc-500">
        If a transfer fails, your token may have Token‑2022 extensions
        (fee/hook/frozen state) that require extra handling.
      </footer>
    </main>
  );
}
