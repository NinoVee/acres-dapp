"use client";

import { useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  getMint,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction
} from "@solana/spl-token";
import { ACRES_MINT } from "@/lib/constants";

export default function TransferAcres2022() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("1");
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
      setStatus("Preparing Token-2022 transfer…");

      const mintInfo = await getMint(connection, ACRES_MINT, "confirmed", TOKEN_2022_PROGRAM_ID);
      const decimals = mintInfo.decimals;

      const fromAta = getAssociatedTokenAddressSync(
        ACRES_MINT,
        publicKey,
        false,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const toAta = getAssociatedTokenAddressSync(
        ACRES_MINT,
        dest,
        false,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const ix: any[] = [];

      const toAtaInfo = await connection.getAccountInfo(toAta, "confirmed");
      if (!toAtaInfo) {
        ix.push(
          createAssociatedTokenAccountInstruction(
            publicKey, // payer
            toAta,
            dest,
            ACRES_MINT,
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }

      const raw = BigInt(Math.round(Number(amount) * 10 ** decimals));

      ix.push(
        createTransferCheckedInstruction(
          fromAta,
          ACRES_MINT,
          toAta,
          publicKey,
          raw,
          decimals,
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );

      const tx = new Transaction().add(...ix);
      const sig = await sendTransaction(tx, connection);
      setStatus(`Sent. Tx: ${sig}`);
    } catch (e: any) {
      setStatus(e?.message ?? "Transfer failed (Token-2022 restrictions may apply).");
    }
  }

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
      <h2 className="text-lg font-medium">Transfer $ACRES (Token-2022)</h2>

      <div className="mt-4 grid gap-3">
        <input
          className="w-full rounded-md border border-zinc-700 bg-zinc-950/40 p-2.5 text-sm"
          placeholder="Destination address"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <input
          className="w-full rounded-md border border-zinc-700 bg-zinc-950/40 p-2.5 text-sm"
          placeholder="Amount ($ACRES)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button
          onClick={onSend}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500"
        >
          Send $ACRES
        </button>

        {status && <div className="text-sm text-zinc-300">{status}</div>}
      </div>
    </section>
  );
}
