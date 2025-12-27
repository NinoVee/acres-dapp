"use client";

import { useMemo, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { ACRES_MINT, WSOL_MINT } from "@/lib/constants";

type Direction = "SOL_TO_ACRES" | "ACRES_TO_SOL";

export default function SwapJupiter() {
  const [direction, setDirection] = useState<Direction>("SOL_TO_ACRES");

  const inputMint = useMemo(
    () => (direction === "SOL_TO_ACRES" ? WSOL_MINT : ACRES_MINT.toBase58()),
    [direction]
  );

  const outputMint = useMemo(
    () => (direction === "SOL_TO_ACRES" ? ACRES_MINT.toBase58() : WSOL_MINT),
    [direction]
  );

  const jupiterUrl = `https://jup.ag/swap?sell=${inputMint}&buy=${outputMint}`;

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
      <h2 className="text-lg font-medium">Swap (Jupiter)</h2>

      <div className="mt-4 grid gap-3">
        <select
          className="w-full rounded-md border border-zinc-700 bg-black text-white p-2.5 text-sm"
          value={direction}
          onChange={(e) => setDirection(e.target.value as Direction)}
        >
          <option value="SOL_TO_ACRES">SOL → $ACRES</option>
          <option value="ACRES_TO_SOL">$ACRES → SOL</option>
        </select>

        <a
  href={jupiterUrl}
  target="_blank"
  rel="noopener noreferrer"
  className="bg-black text-white border border-neon-green shadow-[0_0_15px_#00ff00] hover:shadow-[0_0_20px_#39ff14] rounded-md px-4 py-2 font-bold hover:no-underline focus:outline-none"
>
  Swap on Jupiter
</a>

        <p className="text-xs text-zinc-400">
          You will be redirected to Jupiter to complete your swap.
        </p>
      </div>
    </section>
  );
}


