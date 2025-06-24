import { IconProps } from "./types";

export const SwapIcon: React.FC<IconProps> = ({
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
      <path d="M16 3l4 4-4 4" />
      <path d="M20 7H9a4 4 0 0 0-4 4v1" />
      <path d="M8 21l-4-4 4-4" />
      <path d="M4 17h11a4 4 0 0 0 4-4v-1" />
    </svg>
  );
}; 