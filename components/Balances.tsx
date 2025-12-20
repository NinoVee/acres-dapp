"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ACRES_MINT } from "@/lib/constants";
import { getSolBalance, getToken2022UiBalance } from "@/lib/solana";

export default function Balances() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const [sol, setSol] = useState<number>(0);
  const [acres, setAcres] = useState<number>(0);
  const [status, setStatus] = useState<string>("");

  async function refresh() {
    if (!publicKey) {
      setSol(0);
      setAcres(0);
      setStatus("");
      return;
    }
    setStatus("Refreshing…");
    try {
      const [s, a] = await Promise.all([
        getSolBalance(connection, publicKey),
        getToken2022UiBalance(connection, ACRES_MINT, publicKey)
      ]);
      setSol(s);
      setAcres(a);
      setStatus("");
    } catch (e: any) {
      setStatus(e?.message ?? "Failed to fetch balances.");
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey?.toBase58()]);

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Balances</h2>
        <button
          onClick={refresh}
          className="rounded-md bg-zinc-800 px-3 py-1.5 text-sm hover:bg-zinc-700"
        >
          Refresh
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg bg-zinc-950/40 p-4">
          <div className="text-xs text-zinc-400">SOL</div>
          <div className="mt-1 text-xl">{sol.toFixed(6)}</div>
        </div>
        <div className="rounded-lg bg-zinc-950/40 p-4">
          <div className="text-xs text-zinc-400">$ACRES (Token-2022)</div>
          <div className="mt-1 text-xl">{acres.toFixed(6)}</div>
        </div>
      </div>

      {status && <div className="mt-3 text-sm text-zinc-400">{status}</div>}
    </section>
  );
}
