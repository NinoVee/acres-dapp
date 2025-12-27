"use client";

import { useMemo, useState } from "react";
import { ACRES_MINT, WSOL_MINT } from "@/lib/constants";

type Direction = "SOL_TO_ACRES" | "ACRES_TO_SOL";

export default function SwapJupiter() {
  const [direction, setDirection] = useState<Direction>("SOL_TO_ACRES");
  const [status, setStatus] = useState("");

  const sellMint = useMemo(() => {
    return direction === "SOL_TO_ACRES"
      ? WSOL_MINT
      : ACRES_MINT.toBase58();
  }, [direction]);

  const buyMint = useMemo(() => {
    return direction === "SOL_TO_ACRES"
      ? ACRES_MINT.toBase58()
      : WSOL_MINT;
  }, [direction]);

  const jupiterUrl = useMemo(() => {
    const params = new URLSearchParams({
      sell: sellMint,
      buy: buyMint,
    });
    return `https://jup.ag/swap?${params.toString()}`;
  }, [sellMint, buyMint]);

  function onSwap() {
    setStatus("Redirecting to Jupiter…");
    window.open(jupiterUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
      <h2 className="text-lg font-medium">Swap (Jupiter)</h2>

      <div className="mt-4 grid gap-3">
        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value as Direction)}
          className="w-full rounded-md border border-zinc-700 bg-black p-2.5 text-sm text-white focus:outline-none"
        >
          <option
            value="SOL_TO_ACRES"
            className="bg-black text-white"
          >
            SOL → $ACRES
          </option>
          <option
            value="ACRES_TO_SOL"
            className="bg-black text-white"
          >
            $ACRES → SOL
          </option>
        </select>

        <button
          onClick={onSwap}
          className="bg-black text-white border border-neon-green shadow-[0_0_15px_#00ff00] hover:shadow-[0_0_20px_#39ff14] rounded-md px-4 py-2 font-bold focus:outline-none"
        >
          Swap on Jupiter
        </button>

        {status && <div className="text-sm text-zinc-300">{status}</div>}
      </div>
    </section>
  );
}
