"use client";

import { useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
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

  const inputMint = useMemo(() => {
    return direction === "SOL_TO_ACRES" ? WSOL_MINT : ACRES_MINT.toBase58();
  }, [direction]);

  const outputMint = useMemo(() => {
    return direction === "SOL_TO_ACRES" ? ACRES_MINT.toBase58() : WSOL_MINT;
  }, [direction]);

  async function onSwap() {
    if (!publicKey) return setStatus("Connect wallet first.");

    try {
      setStatus("Preparing quote…");

      // Amount -> raw units
      const decimals =
        direction === "SOL_TO_ACRES" ? 9 : await getAcresDecimals(connection, ACRES_MINT);

      const raw = Math.floor(Number(amount) * 10 ** decimals);
      if (!Number.isFinite(raw) || raw <= 0) return setStatus("Invalid amount.");

      const quoteUrl =
        `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}` +
        `&outputMint=${outputMint}&amount=${raw}&slippageBps=${encodeURIComponent(slippageBps)}`;

      const quote = await fetch(quoteUrl).then((r) => r.json());

      if (!quote?.routePlan?.length) {
        return setStatus("No route found (liquidity may be low or token restrictions).");
      }

      setStatus("Requesting swap transaction…");

      const swapResp = await fetch("https://quote-api.jup.ag/v6/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: publicKey.toBase58(),
          wrapAndUnwrapSol: true
        })
      }).then((r) => r.json());

      const swapTxB64 = swapResp?.swapTransaction;
      if (!swapTxB64) return setStatus("Jupiter did not return a swap transaction.");

      const tx = VersionedTransaction.deserialize(Buffer.from(swapTxB64, "base64"));

      setStatus("Sending swap… approve in wallet.");
      const sig = await sendTransaction(tx as any, connection);
      setStatus(`Swap sent. Tx: ${sig}`);
    } catch (e: any) {
      setStatus(e?.message ?? "Swap failed.");
    }
  }

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
      <h2 className="text-lg font-medium">Swap (Jupiter)</h2>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
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
          placeholder="Slippage (bps) e.g. 100 = 1%"
          value={slippageBps}
          onChange={(e) => setSlippageBps(e.target.value)}
        />
      </div>

      <button
        onClick={onSwap}
        className="mt-3 rounded-md bg-fuchsia-600 px-4 py-2 text-sm font-medium hover:bg-fuchsia-500"
      >
        Swap
      </button>

      {status && <div className="mt-3 text-sm text-zinc-300">{status}</div>}
    </section>
  );
}
