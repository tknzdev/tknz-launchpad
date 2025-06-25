import { useUnifiedWalletContext, useUnifiedWallet, useWallet } from "@jup-ag/wallet-adapter";
import Link from "next/link";
import { Button } from "./ui/button";
import { CreatePoolButton } from "./CreatePoolButton";
import { useMemo, useEffect, useState } from "react";
import { shortenAddress } from "@/lib/utils";
import { toast } from "sonner";

export const Header = () => {
  const unifiedUI = useUnifiedWalletContext();
  const unifiedLogic = useUnifiedWallet();
  const { connect, disconnect, publicKey } = useWallet();
  console.log('Header: unified wallet context keys:', Object.keys(unifiedUI));
  const address = useMemo(() => publicKey?.toBase58(), [publicKey]);
  // Extension wallet public key (from window.tknz.connect)
  const [extPubkey, setExtPubkey] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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
    // Select Tknz extension if available, otherwise fallback to Phantom
    const isTknz = typeof window !== 'undefined' && (window as any).tknz;
    if (isTknz) {
      unifiedLogic.select('Tknz Extension');
    } else {
      unifiedLogic.select('Phantom');
    }
    unifiedLogic.connect().catch((err) => {
      console.error('unified connect error:', err);
      if (err.message?.includes('Redirecting to Chrome Web Store')) {
        toast.info('Opening Chrome Web Store to install TKNZ extension...');
      } else {
        toast.error(err.message || 'Failed to connect wallet');
      }
    });
    setMobileMenuOpen(false);
  };

  const handleDisconnect = () => {
    disconnect();
    setMobileMenuOpen(false);
  };

  return (
    <header className="px-2 sm:px-4 py-2 sm:py-3 border-b border-cyber-green-neon/30 cyber-bg">
      <div className="flex items-center justify-between">
        {/* Logo Section */}
        <Link href="/" className="flex items-center">
          <span className="whitespace-nowrap text-base sm:text-lg md:text-2xl font-bold cyber-title text-cyber-green-neon">
            <span className="glitch" data-text="TKNZ.FUN">
              TKNZ.FUN
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-3 md:gap-4">
          <CreatePoolButton className="text-xs sm:text-sm" />
          {extPubkey ? (
            <Button
              onClick={() => disconnect()}
              className="cyber-mono text-xs md:text-sm px-2 sm:px-3 md:px-4"
            >
              {shortenAddress(extPubkey)}
            </Button>
          ) : address ? (
            <Button
              onClick={() => disconnect()}
              className="cyber-mono text-xs md:text-sm px-2 sm:px-3 md:px-4"
            >
              {shortenAddress(address)}
            </Button>
          ) : (
            <Button
              onClick={handleConnectWallet}
              className="cyber-mono text-xs sm:text-sm px-2 sm:px-3 md:px-4"
            >
              <span className="hidden sm:block">CONNECT WALLET</span>
              <span className="block sm:hidden">CONNECT</span>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-2 text-cyber-green-neon"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {mobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden mt-2 pb-2 border-t border-cyber-green-neon/30 pt-2">
          <div className="flex flex-col gap-2">
            <CreatePoolButton className="w-full text-xs" />
            {extPubkey ? (
              <Button
                onClick={handleDisconnect}
                className="w-full cyber-mono text-xs"
              >
                {shortenAddress(extPubkey)}
              </Button>
            ) : address ? (
              <Button
                onClick={handleDisconnect}
                className="w-full cyber-mono text-xs"
              >
                {shortenAddress(address)}
              </Button>
            ) : (
              <Button
                onClick={handleConnectWallet}
                className="w-full cyber-mono text-xs"
              >
                CONNECT WALLET
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
