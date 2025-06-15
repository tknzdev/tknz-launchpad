import { useUnifiedWalletContext, useWallet } from "@jup-ag/wallet-adapter";
import Link from "next/link";
import { Button } from "./ui/button";
import { CreatePoolButton } from "./CreatePoolButton";
import { useMemo } from "react";
import { shortenAddress } from "@/lib/utils";

export const Header = () => {
  const { setShowModal } = useUnifiedWalletContext();

  const { disconnect, publicKey } = useWallet();
  const address = useMemo(() => publicKey?.toBase58(), [publicKey]);

  const handleConnectWallet = () => {
    setShowModal(true);
  };

  return (
    <header className="w-full px-4 py-3 flex items-center justify-between relative border-b border-cyber-green-neon/30 cyber-bg">
      {/* Background scanning effect */}
      <div className="absolute inset-0 scan-line opacity-30" />

      {/* Logo Section */}
      <Link href="/" className="flex items-center relative z-10">
        <span className="whitespace-nowrap text-lg md:text-2xl font-bold cyber-title text-cyber-green-neon">
          <span className="glitch" data-text="TKNZ.FUN">
            TKNZ.FUN
          </span>
        </span>
      </Link>

      {/* Navigation and Actions */}
      <div className="flex items-center gap-4 relative z-10">
        <CreatePoolButton />
        {address ? (
          <Button
            onClick={() => disconnect()}
            className="cyber-mono text-xs md:text-sm"
          >
            {shortenAddress(address)}
          </Button>
        ) : (
          <Button
            onClick={() => {
              handleConnectWallet();
            }}
            className="cyber-mono"
          >
            <span className="hidden md:block">CONNECT WALLET</span>
            <span className="block md:hidden">CONNECT</span>
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
