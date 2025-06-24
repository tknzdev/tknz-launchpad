import { IconProps } from "./types";

export const ArrowDownIcon: React.FC<IconProps> = ({
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
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  );
}; 