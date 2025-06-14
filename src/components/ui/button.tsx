import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'neon' | 'ghost' | 'danger';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'default', ...props }, ref) => {
    const baseClasses = 'px-4 md:px-6 py-2 md:py-3 rounded-none font-semibold text-xs md:text-sm uppercase tracking-wider transition-all duration-300 relative overflow-hidden cyber-mono';
    
    const variantClasses = {
      default: 'bg-transparent border-2 border-cyber-green-neon text-cyber-green-neon hover:bg-cyber-green-neon hover:text-cyber-black hover:shadow-neon',
      neon: 'bg-cyber-green-neon text-cyber-black border-2 border-cyber-green-neon hover:bg-transparent hover:text-cyber-green-neon hover:shadow-neon-lg',
      ghost: 'bg-transparent border border-cyber-green-neon/50 text-cyber-green-neon/80 hover:border-cyber-green-neon hover:text-cyber-green-neon hover:shadow-cyber',
      danger: 'bg-transparent border-2 border-cyber-red-neon text-cyber-red-neon hover:bg-cyber-red-neon hover:text-cyber-black hover:shadow-[0_0_20px_#ff073a]'
    };

    return (
      <button
        className={cn(
          baseClasses,
          variantClasses[variant],
          'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-cyber-green-neon/20 before:to-transparent before:translate-x-[-100%] before:transition-transform before:duration-500 hover:before:translate-x-[100%]',
          className
        )}
        ref={ref}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';