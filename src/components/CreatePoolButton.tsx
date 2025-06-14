import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

type CreatePoolButtonProps = {
  className?: string;
};

export const CreatePoolButton = ({ className }: CreatePoolButtonProps) => {
  return (
    <Button variant="neon" className={className}>
      <Link href="/create-pool" className="flex items-center gap-2">
        <span className="iconify ph--rocket-bold w-4 h-4" />
        <span className="cyber-mono">CREATE POOL</span>
      </Link>
    </Button>
  );
};