"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Balances from "@/components/Balances";
import TransferSol from "@/components/TransferSol";
import TransferAcres2022 from "@/components/TransferAcres2022";
import SwapJupiter from "@/components/SwapJupiter";

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">$ACRES ↔ SOL dApp</h1>
        <WalletMultiButton />
      </div>

      <p className="mt-3 text-sm text-zinc-300">
        Transfers are Token-2022 compatible. Swaps are routed through Jupiter.
      </p>

      <div className="mt-6 grid gap-6">
        <Balances />
        <div className="grid gap-6 md:grid-cols-2">
          <TransferSol />
          <TransferAcres2022 />
        </div>
        <SwapJupiter />
      </div>

      <footer className="mt-10 text-xs text-zinc-500">
        If a transfer fails, your token may have Token-2022 extensions (fee/hook/frozen state) that require extra accounts.
      </footer>
    </main>
  );
}
