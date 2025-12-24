import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "$ACRES dApp",
  description: "Token-2022 transfer + Jupiter swap + mass wallet transfer"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <Providers>
          <main className="min-h-screen p-4">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
