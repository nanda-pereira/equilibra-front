import type { ReactNode } from "react";
import { Link } from "react-router";
import ArrowRightIcon from "./ArrowRightIcon";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "outline" | "cta" | "action" | "actionOutline";
  size?: "sm" | "md"; // sm = botão do header (43px); ignorado nas variantes action*
  withArrow?: boolean;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
};

export default function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  withArrow = false,
  className = "",
  onClick,
  type = "button",
}: ButtonProps) {
  const isAction = variant === "action" || variant === "actionOutline";
  const height = size === "sm" ? "h-[43px]" : "h-11";

  let padding = "px-[18px]"; // hero primário: 194px
  if (size === "sm") padding = "px-[13.5px]"; // header: 185px
  else if (variant === "outline") padding = "px-[31.5px]"; // "Saiba mais": 148px
  if (withArrow) padding = "pl-[17px] pr-[13.5px]"; // "Saiba como funciona": 218px

  const looks = {
    primary: "bg-brand text-white hover:bg-action",
    outline: "border border-brand text-brand hover:bg-mint-100",
    cta: "border-2 border-[#253c41] bg-[#62b2ad] text-[#253c41] hover:bg-action",
    // Cadastro e app: ação em #247477 (AA). Um primário por tela.
    action:
      "bg-action text-white shadow-[0_10px_24px_rgba(36,116,119,0.28)] hover:bg-action-hover",
    actionOutline:
      "border-2 border-action bg-white/60 text-action hover:bg-mint-100",
  };

  let shape: string;
  if (isAction) {
    shape = "h-14 justify-center gap-[10px] px-8 text-base font-semibold leading-6";
  } else if (variant === "cta") {
    shape =
      "h-11 w-[157px] justify-start gap-[19px] pl-[14px] text-[15px] font-normal leading-normal";
  } else {
    shape = `${height} ${padding} justify-center gap-2 text-base font-normal leading-[23px]`;
  }

  const classes = `inline-flex items-center whitespace-nowrap rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action ${shape} ${looks[variant]} ${className}`;

  const content = (
    <>
      {children}
      {withArrow && <ArrowRightIcon />}
    </>
  );

  if (href?.startsWith("/")) {
    return (
      <Link to={href} className={classes}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {content}
    </button>
  );
}