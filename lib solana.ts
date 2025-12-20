import { Connection, PublicKey } from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  getMint,
  getAccount
} from "@solana/spl-token";

export async function getSolBalance(connection: Connection, owner: PublicKey): Promise<number> {
  const lamports = await connection.getBalance(owner, "confirmed");
  return lamports / 1e9;
}

export async function getAcresDecimals(connection: Connection, mint: PublicKey): Promise<number> {
  const mintInfo = await getMint(connection, mint, "confirmed", TOKEN_2022_PROGRAM_ID);
  return mintInfo.decimals;
}

export function getToken2022ATA(mint: PublicKey, owner: PublicKey): PublicKey {
  return getAssociatedTokenAddressSync(
    mint,
    owner,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
}

export async function getToken2022UiBalance(
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey
): Promise<number> {
  const ata = getToken2022ATA(mint, owner);
  const info = await connection.getAccountInfo(ata, "confirmed");
  if (!info) return 0;

  const [decimals, account] = await Promise.all([
    getAcresDecimals(connection, mint),
    getAccount(connection, ata, "confirmed", TOKEN_2022_PROGRAM_ID)
  ]);

  // account.amount is bigint
  const raw = Number(account.amount);
  return raw / 10 ** decimals;
}
