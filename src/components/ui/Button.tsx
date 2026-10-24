import type { ReactNode } from "react";
import ArrowRightIcon from "./ArrowRightIcon";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "outline";
  size?: "sm" | "md"; // sm = botão do header
  withArrow?: boolean;
  className?: string;
  onClick?: () => void;
};

export default function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  withArrow = false,
  className = "",
  onClick,
}: ButtonProps) {
  const height = size === "sm" ? "h-[43px]" : "h-11";

  let padding = "px-[18px]";
  if (size === "sm") padding = "px-[13.5px]";
  else if (variant === "outline") padding = "px-[31.5px]";
  if (withArrow) padding = "pl-[17px] pr-[13.5px]";

  const look =
    variant === "primary"
      ? "bg-brand text-white hover:bg-action"
      : "border border-brand text-brand hover:bg-mint-100";

  const classes = `inline-flex ${height} ${padding} items-center justify-center gap-2 whitespace-nowrap rounded-full text-base font-normal leading-[23px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action ${look} ${className}`;

  const content = (
    <>
      {children}
      {withArrow && <ArrowRightIcon />}
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  );
}