import { IconProps } from "./types";

export const GraduateIcon: React.FC<IconProps> = ({
  className,
  viewBox = "0 0 24 24",
  ...props
}) => {
  return (
    <svg
      viewBox={viewBox}
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M12 3L1 9L5 11.18V17.18L12 21L19 17.18V11.18L21 10.09V17H23V9L12 3M18.82 9L12 12.72L5.18 9L12 5.28L18.82 9M17 15.99L12 18.72L7 15.99V12.27L12 15L17 12.27V15.99Z" />
    </svg>
  );
}; 