import { useUnifiedWalletContext, useUnifiedWallet, useWallet } from "@jup-ag/wallet-adapter";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { CreatePoolButton } from "./CreatePoolButton";
import { useMemo, useEffect, useState } from "react";
import { shortenAddress } from "@/lib/utils";

export const Header = () => {
  const unifiedUI = useUnifiedWalletContext();
  const unifiedLogic = useUnifiedWallet();
  const { connect, disconnect, publicKey } = useWallet();
  console.log('Header: unified wallet context keys:', Object.keys(unifiedUI));
  const address = useMemo(() => publicKey?.toBase58(), [publicKey]);
  // Extension wallet public key (from window.tknz.connect)
  const [extPubkey, setExtPubkey] = useState<string | null>(null);
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.source === 'tknz' && e.data.type === 'CONNECT_RESPONSE') {
        console.log('Header: received CONNECT_RESPONSE', e.data);
        if (e.data.success) {
          setExtPubkey(e.data.publicKey || null);
        } else {
          console.log('Header: connect failed', e.data);
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const handleConnectWallet = () => {
    unifiedLogic.select('Tknz Extension' as any);
    unifiedLogic.connect().catch((err) => console.error('unified connect error:', err));
  };

  return (
    <header className="w-full bg-black/95 border-b border-cyber-green-neon/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section - Left aligned */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.png" 
                alt="TKNZ.FUN"
                width={100}
                height={32}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Navigation and Actions - Right aligned */}
          <div className="flex items-center space-x-4">
            <CreatePoolButton />
            {extPubkey ? (
              <Button
                onClick={() => disconnect()}
                className="cyber-mono text-xs md:text-sm"
              >
                {shortenAddress(extPubkey)}
              </Button>
            ) : address ? (
              <Button
                onClick={() => disconnect()}
                className="cyber-mono text-xs md:text-sm"
              >
                {shortenAddress(address)}
              </Button>
            ) : (
              <Button
                onClick={handleConnectWallet}
                className="cyber-mono"
              >
                <span className="hidden md:inline">CONNECT WALLET</span>
                <span className="inline md:hidden">CONNECT</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
