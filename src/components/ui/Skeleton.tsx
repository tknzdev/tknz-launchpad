import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";

const skeletonVariants = cva(
  "h-12 w-full rounded-none bg-cyber-green-neon/10",
  {
    variants: {
      variant: {
        shimmer:
          "animate-pulse bg-gradient-to-r from-cyber-green-neon/5 via-cyber-green-neon/20 to-cyber-green-neon/5 bg-[length:200%_100%] animate-[shimmer_2s_infinite]",
        pulse: "animate-pulse",
      },
      color: {
        default: "bg-cyber-green-neon/10",
        muted: "bg-cyber-green-neon/5",
      },
    },
    defaultVariants: {
      variant: "shimmer",
      color: "default",
    },
  },
);

type SkeletonProps = React.ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof skeletonVariants>;

export const Skeleton: React.FC<SkeletonProps> = ({
  variant,
  color,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(skeletonVariants({ variant, color }), className)}
      {...props}
    />
  );
};
