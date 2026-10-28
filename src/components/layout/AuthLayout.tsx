import type { ReactNode } from "react";
import { Link } from "react-router";
import logo from "../../assets/pedras-logo.svg";

type AuthLayoutProps = {
  children: ReactNode;
  background?: "figma" | "design-system";
};

export default function AuthLayout({
  children,
  background = "figma",
}: AuthLayoutProps) {
  return (
    <div className="relative isolate min-h-svh overflow-hidden bg-page">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {background === "design-system" ? (
          <>
            <div className="absolute -left-[160px] -top-[220px] size-[640px] rounded-full bg-[#bfe3df]/70 blur-[90px]" />
            <div className="absolute -bottom-[260px] -right-[120px] size-[720px] rounded-full bg-brand/22 blur-[100px]" />

            <img
              src={logo}
              alt=""
              className="absolute bottom-6 right-6 hidden w-[340px] opacity-[0.07] md:block"
            />
          </>
        ) : (
          <>
            <div className="absolute -left-[140px] -top-[100px] size-[520px] rounded-full bg-mint-200/60 blur-[100px]" />
            <div className="absolute -left-[220px] top-[18%] h-[60%] w-[420px] rounded-full bg-mint-200/40 blur-[110px]" />
            <div className="absolute -bottom-[220px] -right-[180px] size-[560px] rounded-full bg-brand/15 blur-[110px]" />
          </>
        )}
      </div>

      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-5 px-5 py-8 md:px-10 md:pb-12 md:pt-14">
        <Link
          to="/"
          aria-label="Equilibra — página inicial"
          className="mx-auto flex w-fit items-center gap-1.5"
        >
          <img src={logo} alt="" className="h-12 w-auto md:h-[60px]" />
          <span className="text-lg font-semibold tracking-[0.32em] text-deep md:text-[22px]">
            EQUILIBRA
          </span>
        </Link>

        <main>{children}</main>
      </div>
    </div>
  );
}