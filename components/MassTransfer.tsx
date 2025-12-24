"use client";

import React, { useState } from "react";
import Papa from "papaparse";
import type { ParseResult } from "papaparse";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { WalletContextState } from "@solana/wallet-adapter-react";

const RPC_URL = "https://api.mainnet-beta.solana.com";

// ✅ Token‑2022 Mint
const TOKEN_MINT = new PublicKey(
  "9hTF4azRpZQFqgZ3YpgACD3aSbbB4NkeEUhp7NKZvmWe"
);

// ✅ Confirmed decimals
const TOKEN_DECIMALS = 9;

interface Recipient {
  Wallet: string;
  Amount: string;
}

interface MassTransferProps {
  wallet: WalletContextState;
}

export default function MassTransfer({ wallet }: MassTransferProps) {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(false);

  /* ========== CSV Upload ========== */
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<Recipient>) => {
        const parsed = results.data.filter(
          (r) =>
            r &&
            typeof r.Wallet === "string" &&
            typeof r.Amount === "string" &&
            !isNaN(Number(r.Amount))
        );
        setRecipients(parsed);
      },
    });
  };

  /* ========== Mass Transfer ========== */
  const handleMassTransfer = async () => {
    if (!wallet.publicKey || recipients.length === 0) return;

    setLoading(true);
    const connection = new Connection(RPC_URL, "confirmed");
    const sender = wallet.publicKey;

    const senderATA = await getAssociatedTokenAddress(
      TOKEN_MINT,
      sender,
      false,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const CHUNK_SIZE = 4;

    for (let i = 0; i < recipients.length; i += CHUNK_SIZE) {
      const tx = new Transaction();
      const chunk = recipients.slice(i, i + CHUNK_SIZE);

      for (const row of chunk) {
        try {
          const recipient = new PublicKey(row.Wallet.trim());
          const amount = BigInt(
            Math.floor(Number(row.Amount) * 10 ** TOKEN_DECIMALS)
          );

          const recipientATA = await getAssociatedTokenAddress(
            TOKEN_MINT,
            recipient,
            false,
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          );

          const ataInfo = await connection.getAccountInfo(recipientATA);
          if (!ataInfo) {
            tx.add(
              createAssociatedTokenAccountInstruction(
                sender,
                recipientATA,
                recipient,
                TOKEN_MINT,
                TOKEN_2022_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
              )
            );
          }

          tx.add(
            createTransferInstruction(
              senderATA,
              recipientATA,
              sender,
              amount,
              [],
              TOKEN_2022_PROGRAM_ID
            )
          );
        } catch (err) {
          console.error("❌ Skipping row:", row, err);
        }
      }

      try {
        const sig = await wallet.sendTransaction(tx, connection);
        await connection.confirmTransaction(sig, "confirmed");
        console.log("✅ Batch sent:", sig);
      } catch (err) {
        console.error("❌ Batch failed:", err);
      }
    }

    setLoading(false);
    alert("✅ Mass transfer complete");
  };

  /* ========== UI ========== */
  return (
    <div className="card mt-6">
      <h2 className="text-xl font-bold mb-3 text-green-400">
        Mass Transfer (Token‑2022)
      </h2>

      <p className="text-sm text-zinc-400 mb-3">
        CSV format: <code>Wallet,Amount</code>
      </p>

      <input
        type="file"
        accept=".csv"
        onChange={handleCSVUpload}
        className="mb-4 w-full"
      />

      <button
        onClick={handleMassTransfer}
        disabled={loading || recipients.length === 0}
        className="neon-button w-full"
      >
        {loading ? "Transferring..." : `Send to ${recipients.length} wallets`}
      </button>
    </div>
  );
}
