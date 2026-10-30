import type { ReactNode } from "react";
import { Link } from "react-router";

type SmallButtonProps = {
  children: ReactNode;
  to?: string;
  onClick?: () => void;
  variant?: "solid" | "outline";
  /** nome acessível quando o texto do botão sozinho não basta */
  label?: string;
};

export default function SmallButton({
  children,
  to,
  onClick,
  variant = "outline",
  label,
}: SmallButtonProps) {
  const classes = `inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action ${
    variant === "solid"
      ? "bg-action text-white hover:bg-action-hover"
      : "border border-brand text-action hover:bg-mint-100"
  }`;

  if (to) {
    return (
      <Link to={to} aria-label={label} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} aria-label={label} className={classes}>
      {children}
    </button>
  );
}