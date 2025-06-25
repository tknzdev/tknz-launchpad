import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

type CreatePoolButtonProps = {
  className?: string;
};

export const CreatePoolButton = ({ className }: CreatePoolButtonProps) => {
  return (
    <Button variant="neon" className={cn("px-3 md:px-4", className)}>
      <Link href="/create-pool" className="flex items-center gap-1 md:gap-2">
        <span className="iconify ph--rocket-bold w-4 h-4 hidden sm:block" />
        <span className="cyber-mono text-xs md:text-sm">
          <span className="sm:hidden">CREATE</span>
          <span className="hidden sm:inline">CREATE POOL</span>
        </span>
      </Link>
    </Button>
  );
};
