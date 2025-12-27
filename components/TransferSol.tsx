          fromPubkey: publicKey,
          toPubkey: dest,
          lamports
        })
      );

      const sig = await sendTransaction(tx, connection);
      setStatus(`Sent. Tx: ${sig}`);
    } catch (e: any) {
      setStatus(e?.message ?? "Transfer failed.");
    }
  }

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
      <h2 className="text-lg font-medium">Transfer SOL</h2>

      <div className="mt-4 grid gap-3">
        <input
          className="w-full rounded-md border border-zinc-700 bg-zinc-950/40 p-2.5 text-sm"
          placeholder="Destination address"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <input
          className="w-full rounded-md border border-zinc-700 bg-zinc-950/40 p-2.5 text-sm"
          placeholder="Amount (SOL)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button
          onClick={onSend}
          className="bg-black text-white border border-neon-green shadow-[0_0_15px_#00ff00] hover:shadow-[0_0_20px_#39ff14] rounded-md px-4 py-2 font-bold">

          Send SOL
        </button>

        {status && <div className="text-sm text-zinc-300">{status}</div>}
      </div>
    </section>
  );
}
