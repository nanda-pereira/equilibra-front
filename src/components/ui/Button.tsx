import type { ReactNode } from "react";
import ArrowRightIcon from "./ArrowRightIcon";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "outline" | "cta";
  size?: "sm" | "md"; // sm = botão do header (43px)
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

  let padding = "px-[18px]"; // hero primário: 194px
  if (size === "sm") padding = "px-[13.5px]"; // header: 185px
  else if (variant === "outline") padding = "px-[31.5px]"; // "Saiba mais": 148px
  if (withArrow) padding = "pl-[17px] pr-[13.5px]"; // "Saiba como funciona": 218px

  const looks = {
    primary: "bg-brand text-[#FFFF] hover:bg-action",
    outline: "border border-brand text-brand hover:bg-mint-100",
    cta: "border-2 border-[#253c41] bg-[#62b2ad] text-[#253c41] hover:bg-action",
  };

  const shape =
    variant === "cta"
      ? "h-11 w-[157px] justify-start gap-[19px] pl-[14px] text-[15px] leading-normal"
      : `${height} ${padding} justify-center gap-2 text-base leading-[23px]`;

  const classes = `inline-flex items-center whitespace-nowrap rounded-full font-normal transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action ${shape} ${looks[variant]} ${className}`;

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