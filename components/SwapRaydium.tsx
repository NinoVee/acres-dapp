"use client";

import { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { createPoolKeys, swap } from "@raydium-io/raydium-sdk";
import { ACRES_MINT } from "@/lib/constants";

export default function SwapRaydium() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [amount, setAmount] = useState("0.01");
  const [status, setStatus] = useState("");

  const poolId = new PublicKey("YOUR_RAYDIUM_POOL_ID"); // Replace with actual Raydium pool ID

  const onSwap = async () => {
    if (!publicKey) {
      setStatus("Please connect your wallet.");
      return;
    }

    try {
      setStatus("Preparing swap…");

      const poolKeys = await createPoolKeys(connection, poolId);
      
      const result = await swap({
        connection,
        poolKeys,
        amountIn: Number(amount), // Adjust decimals
        tokenAccounts: [],
        userPublicKey: publicKey,
        signTransaction: sendTransaction,
        slippage: 0.01, // 1% slippage
      });

      setStatus(`✅ Swap submitted: ${result.txid}`);
    } catch (err) {
      console.error(err);
      setStatus("Swap failed.");
    }
  };

  return (
    <section className="p-5 border rounded-lg bg-zinc-900 text-white">
      <h2 className="text-lg font-semibold mb-2">Swap using Raydium SDK</h2>
      <input
        type="text"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="mb-3 p-2 w-full text-black"
        placeholder="Amount"
      />
      <button
        onClick={onSwap}
        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
      >
        Swap
      </button>
      <p className="mt-3 text-sm">{status}</p>
    </section>
  );
}
