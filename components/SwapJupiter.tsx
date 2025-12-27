"use client";

import { useMemo, useState } from "react";
import { ACRES_MINT, WSOL_MINT } from "@/lib/constants";

type Direction = "SOL_TO_ACRES" | "ACRES_TO_SOL";

export default function SwapJupiterRedirect() {
  const [direction, setDirection] = useState<Direction>("SOL_TO_ACRES");
  const [slippageBps, setSlippageBps] = useState("100"); // Optional, Jupiter handles defaults

  const sellMint = useMemo(() => {
    return direction === "SOL_TO_ACRES" ? WSOL_MINT : ACRES_MINT.toBase58();
  }, [direction]);

  const buyMint = useMemo(() => {
    return direction === "SOL_TO_ACRES" ? ACRES_MINT.toBase58() : WSOL_MINT;
  }, [direction]);

  const jupiterUrl = useMemo(() => {
    const params = new URLSearchParams({
      sell: sellMint,
      buy: buyMint,
      slippageBps,
    });

    return `https://jup.ag/swap?${params.toString()}`;
  }, [sellMint, buyMint, slippageBps]);

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
      <h2 className="text-lg font-medium">Swap (Jupiter)</h2>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
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
          placeholder="Slippage BPS (100 = 1%)"
          value={slippageBps}
          onChange={(e) => setSlippageBps(e.target.value)}
        />
      </div>

      <a
        href={jupiterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block bg-black text-white border border-neon-green shadow-[0_0_15px_#00ff00] hover:shadow-[0_0_20px_#39ff14] rounded-md px-4 py-2 font-bold"
      >
        Swap on Jupiter
      </a>

      <p className="mt-3 text-xs text-zinc-400">
        You’ll be redirected to Jupiter to complete the swap.
      </p>
    </section>
  );
}
