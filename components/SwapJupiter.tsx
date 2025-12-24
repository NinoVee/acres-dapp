"use client";

import { useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction, PublicKey } from "@solana/web3.js";
import { ACRES_MINT, WSOL_MINT } from "@/lib/constants";
import { getAcresDecimals } from "@/lib/solana";

type Direction = "SOL_TO_ACRES" | "ACRES_TO_SOL";

export default function SwapJupiter() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [direction, setDirection] = useState<Direction>("SOL_TO_ACRES");
  const [amount, setAmount] = useState("0.01");
  const [slippageBps, setSlippageBps] = useState("100");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------- MINTS ---------- */
  const inputMint = useMemo(
    () => (direction === "SOL_TO_ACRES" ? WSOL_MINT : ACRES_MINT.toBase58()),
    [direction]
  );

  const outputMint = useMemo(
    () => (direction === "SOL_TO_ACRES" ? ACRES_MINT.toBase58() : WSOL_MINT),
    [direction]
  );

  /* ---------- SWAP ---------- */
  async function onSwap() {
    if (!publicKey) {
      setStatus("Connect wallet first.");
      return;
    }

    try {
      setLoading(true);
      setStatus("Fetching Jupiter quote…");

      const decimals =
        direction === "SOL_TO_ACRES"
          ? 9
          : await getAcresDecimals(connection, ACRES_MINT);

      const rawAmount = Math.floor(Number(amount) * 10 ** decimals);
      if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
        setStatus("Invalid amount.");
        return;
      }

      /* ---------- QUOTE ---------- */
      const quoteRes = await fetch(
        `https://quote-api.jup.ag/v6/quote` +
          `?inputMint=${inputMint}` +
          `&outputMint=${outputMint}` +
          `&amount=${rawAmount}` +
          `&slippageBps=${slippageBps}`
      ).then((r) => r.json());

      if (!quoteRes?.data?.length) {
        console.error("Jupiter quote error:", quoteRes);
        setStatus("No swap route found. Try a different amount.");
        return;
      }

      const route = quoteRes.data[0];

      setStatus("Building swap transaction…");

      /* ---------- SWAP TX ---------- */
      const swapRes = await fetch("https://quote-api.jup.ag/v6/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteResponse: route,
          userPublicKey: publicKey.toBase58(),
          wrapAndUnwrapSol: true,
        }),
      }).then((r) => r.json());

      if (!swapRes?.swapTransaction) {
        console.error("Swap response error:", swapRes);
        setStatus("Failed to create swap transaction.");
        return;
      }

      const tx = VersionedTransaction.deserialize(
        Buffer.from(swapRes.swapTransaction, "base64")
      );

      setStatus("Approve swap in wallet…");
      const sig = await sendTransaction(tx, connection);

      setStatus(`✅ Swap sent: ${sig}`);
    } catch (err: any) {
      console.error("Swap failed:", err);
      setStatus(err?.message || "Swap failed.");
    } finally {
      setLoading(false);
    }
  }

  /* ---------- UI ---------- */
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
      <h2 className="text-lg font-medium mb-3">Swap (Jupiter)</h2>

      <div className="grid gap-3 md:grid-cols-3">
        <select
          className="rounded-md border border-zinc-700 bg-zinc-950/40 p-2.5 text-sm"
          value={direction}
          onChange={(e) => setDirection(e.target.value as Direction)}
        >
          <option value="SOL_TO_ACRES">SOL → $ACRES</option>
          <option value="ACRES_TO_SOL">$ACRES → SOL</option>
        </select>

        <input
          className="rounded-md border border-zinc-700 bg-zinc-950/40 p-2.5 text-sm"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <input
          className="rounded-md border border-zinc-700 bg-zinc-950/40 p-2.5 text-sm"
          placeholder="Slippage (bps)"
          value={slippageBps}
          onChange={(e) => setSlippageBps(e.target.value)}
        />
      </div>

      <button
        onClick={onSwap}
        disabled={loading}
        className="mt-4 w-full bg-black text-white border border-neon-green shadow-[0_0_15px_#00ff00] hover:shadow-[0_0_20px_#39ff14] rounded-md px-4 py-2 font-bold disabled:opacity-50"
      >
        {loading ? "Swapping…" : "Swap"}
      </button>

      {status && <div className="mt-3 text-sm text-zinc-300">{status}</div>}
    </section>
  );
}
