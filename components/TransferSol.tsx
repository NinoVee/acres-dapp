"use client";

import { useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";

export default function TransferSol() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("0.01");
  const [status, setStatus] = useState("");

  const dest = useMemo(() => {
    try {
      return new PublicKey(to);
    } catch {
      return null;
    }
  }, [to]);

  async function onSend() {
    if (!publicKey) return setStatus("Connect wallet first.");
    if (!dest) return setStatus("Invalid destination address.");

    try {
      setStatus("Building SOL transfer…");
      const lamports = Math.floor(Number(amount) * LAMPORTS_PER_SOL);

      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: dest,
          lamports
        })
      );

      const sig = await sendTransaction(tx, connection);
      setStatus(`Sent. Tx: ${sig}`);
    } catch (e: any) {
      setStatus(e?.message ?? "Transfer failed.");
    }
  }

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
      <h2 className="text-lg font-medium">Transfer SOL</h2>

      <div className="mt-4 grid gap-3">
        <input
          className="w-full rounded-md border border-zinc-700 bg-zinc-950/40 p-2.5 text-sm"
          placeholder="Destination address"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <input
          className="w-full rounded-md border border-zinc-700 bg-zinc-950/40 p-2.5 text-sm"
          placeholder="Amount (SOL)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button
          onClick={onSend}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500"
        >
          Send SOL
        </button>

        {status && <div className="text-sm text-zinc-300">{status}</div>}
      </div>
    </section>
  );
}
