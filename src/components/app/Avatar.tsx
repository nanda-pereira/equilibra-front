type AvatarProps = { name: string; tone?: "solid" | "soft"; className?: string };

export default function Avatar({ name, tone = "solid", className = "" }: AvatarProps) {
  const palette = tone === "solid" ? "bg-action text-white" : "bg-mint-100 text-action";
  return (
    <span
      aria-hidden="true"
      className={`flex size-10 shrink-0 items-center justify-center rounded-full text-base font-semibold ${palette} ${className}`}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}