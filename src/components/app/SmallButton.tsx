
import type { ReactNode } from "react";
import { Link } from "react-router";

type SmallButtonProps = {
  children: ReactNode;
  to?: string;
  onClick?: () => void;
  variant?: "solid" | "outline";
  label?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

export default function SmallButton({
  children,
  to,
  onClick,
  variant = "outline",
  label,
  type = "button",
  disabled = false,
}: SmallButtonProps) {
  const classes = `inline-flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action ${
    variant === "solid"
      ? "bg-action text-white hover:bg-action-hover"
      : "border border-brand text-action hover:bg-mint-100"
  }`;

  if (to) {
    return (
      <Link
        to={to}
        aria-label={label}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
        className={`${classes} ${
          disabled ? "pointer-events-none opacity-50" : ""
        }`}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={label}
      className={`${classes} disabled:cursor-not-allowed disabled:opacity-50`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}