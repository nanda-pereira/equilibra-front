import logo from "../../assets/pedras-logo.svg";

// Mesma marca do header: símbolo 62x53 + wordmark. TODO figma: tamanho do wordmark
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-1.5 ${className}`}>
      <img src={logo} alt="" className="h-10 w-auto md:h-[53px]" />
      <span className="text-base font-semibold tracking-[0.32em] text-deep md:text-[22px]">
        EQUILIBRA
      </span>
    </span>
  );
}