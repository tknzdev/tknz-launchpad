import { IconProps } from "./types";

export const FireIcon: React.FC<IconProps> = ({
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
      <path d="M12 23C7 23 3 19 3 14C3 11.2 4.2 8.4 6.1 6.1C6.5 5.6 7.3 5.7 7.6 6.3L8.8 8.5C9.4 7.5 10.1 6.5 11 5.5C11.4 5.1 12.1 5.2 12.4 5.7L13.8 8C14.3 7.2 14.8 6.3 15.5 5.3C15.8 4.9 16.4 4.9 16.8 5.3C19.1 7.6 21 10.7 21 14C21 19 17 23 12 23ZM8.5 18C8.5 19.4 9.6 20.5 11 20.5C12.4 20.5 13.5 19.4 13.5 18C13.5 16.6 12 14 12 14C12 14 8.5 16.6 8.5 18Z" />
    </svg>
  );
}; 