import { useUnifiedWalletContext, useUnifiedWallet, useWallet } from "@jup-ag/wallet-adapter";
import Link from "next/link";
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
    <header className="px-4 py-3 border-b border-cyber-green-neon/30 cyber-bg">
      <div className="flex items-center justify-between">
        {/* Logo Section */}
        <Link href="/" className="flex items-center">
          <span className="whitespace-nowrap text-lg md:text-2xl font-bold cyber-title text-cyber-green-neon">
            <span className="glitch" data-text="TKNZ.FUN">
              TKNZ.FUN
            </span>
          </span>
        </Link>

        {/* Navigation and Actions */}
        <div className="flex items-center gap-4">
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
              <span className="hidden md:block">CONNECT WALLET</span>
              <span className="block md:hidden">CONNECT</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
