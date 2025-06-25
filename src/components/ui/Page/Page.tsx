import Header from "@/components/Header";
import { cn } from "@/lib/utils";

interface IProps {
  containerClassName?: string;
  pageClassName?: string;
}

const Page: React.FC<React.PropsWithChildren<IProps>> = ({
  containerClassName,
  children,
  pageClassName,
}) => {
  return (
    <div
      className={cn(
        "flex min-h-screen flex-col justify-between bg-cyber-black text-cyber-green-neon matrix-bg",
        pageClassName,
      )}
    >
      <Header />
      <div
        className={cn(
          "flex flex-1 flex-col items-center px-1 md:px-3 pt-4 pb-16 relative",
          containerClassName,
        )}
      >
        {/* Cyberpunk grid overlay */}
        <div className="absolute inset-0 bg-cyber-grid bg-grid opacity-20 pointer-events-none" />

        {/* Scanning line effect */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-green-neon to-transparent animate-scan opacity-60 hidden md:block" />

        <div className="lg:max-w-7xl w-full relative z-10">{children}</div>
      </div>
    </div>
  );
};

export default Page;
