// MassTransferTab.jsx
import React, { useState } from 'react';
import Papa from 'papaparse';
import {
  Connection,
  PublicKey,
  Transaction,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
} from '@solana/spl-token';

const TOKEN_MINT = 'YOUR_ACRES_TOKEN_MINT'; // <-- Replace with actual Token Mint
const RPC_URL = 'https://api.mainnet-beta.solana.com';

export default function MassTransferTab({ wallet }) {
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const data = results.data.filter(r => r.Wallet && r.Amount);
        setRecipients(data);
      },
    });
  };

  const handleMassTransfer = async () => {
    if (!wallet?.publicKey || recipients.length === 0) return;

    setLoading(true);
    const connection = new Connection(RPC_URL);
    const mint = new PublicKey(TOKEN_MINT);
    const sender = wallet.publicKey;

    const CHUNK_SIZE = 5; // prevent exceeding compute budget
    for (let i = 0; i < recipients.length; i += CHUNK_SIZE) {
      const chunk = recipients.slice(i, i + CHUNK_SIZE);
      const tx = new Transaction();

      for (const { Wallet, Amount } of chunk) {
        try {
          const recipient = new PublicKey(Wallet.trim());
          const fromATA = await getAssociatedTokenAddress(mint, sender);
          const toATA = await getAssociatedTokenAddress(mint, recipient);

          const ix = createTransferInstruction(
            fromATA,
            toATA,
            sender,
            Number(Amount) * 1e6 // Adjust for token decimals
          );
          tx.add(ix);
        } catch (err) {
          console.error('Invalid wallet or amount:', Wallet, Amount);
        }
      }

      try {
        const sig = await wallet.sendTransaction(tx, connection);
        console.log('Tx sent:', sig);
      } catch (e) {
        console.error('Transaction failed:', e);
      }
    }
    setLoading(false);
  };

  return (
    <div className="card mt-4">
      <h2 className="text-xl font-bold mb-4">Mass Transfer</h2>
      <input
        type="file"
        accept=".csv"
        onChange={handleCSVUpload}
        className="mb-4 neon-input"
      />
      <button
        onClick={handleMassTransfer}
        className="neon-button"
        disabled={loading || !recipients.length}
      >
        {loading ? 'Transferring...' : 'Execute Mass Transfer'}
      </button>
    </div>
  );
}
