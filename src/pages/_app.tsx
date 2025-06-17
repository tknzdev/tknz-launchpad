import "@/styles/globals.css";
import { Adapter, UnifiedWalletProvider } from "@jup-ag/wallet-adapter";
import type { AppProps } from "next/app";
import { Toaster } from "sonner";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { TknzWalletAdapter } from "@/utils/TknzWalletAdapter";
import { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useWindowWidthListener } from "@/lib/device";

export default function App({ Component, pageProps }: AppProps) {
  const wallets: Adapter[] = useMemo(() => {
    const list: Adapter[] = [];
    // Always register the Tknz extension adapter (SSR+CSR) for consistent hydration
    list.push(new TknzWalletAdapter());
    // Fallbacks for Phantom and Solflare
    [new PhantomWalletAdapter(), new SolflareWalletAdapter()].forEach((w) => {
      if (w.name && w.icon) list.push(w);
    });
    console.log('App: wallet adapters configured:', list.map((w) => w.name));
    return list as Adapter[];
  }, []);

  const queryClient = useMemo(() => new QueryClient(), []);

  useWindowWidthListener();

  return (
    <QueryClientProvider client={queryClient}>
      <UnifiedWalletProvider
        wallets={wallets}
        config={{
        env: "mainnet-beta",
        autoConnect: true,
        walletPrecedence: wallets.map((w) => w.name),
          metadata: {
            name: "UnifiedWallet",
            description: "UnifiedWallet",
            url: "https://jup.ag",
            iconUrls: ["https://jup.ag/favicon.ico"],
          },
          // notificationCallback: WalletNotification,
          theme: "dark",
          lang: "en",
        }}
      >
        <Toaster />
        <Component {...pageProps} />
      </UnifiedWalletProvider>
    </QueryClientProvider>
  );
}
