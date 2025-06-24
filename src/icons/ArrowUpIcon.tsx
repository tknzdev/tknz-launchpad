import { IconProps } from "./types";

export const ArrowUpIcon: React.FC<IconProps> = ({
  className,
  viewBox = "0 0 24 24",
  ...props
}) => {
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}; 