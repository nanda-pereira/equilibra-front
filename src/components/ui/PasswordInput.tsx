import { useState, type ComponentProps } from "react";
import Input from "./Input";

type PasswordInputProps = Omit<ComponentProps<typeof Input>, "type" | "trailing">;

export default function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          className="rounded-full px-2 py-1 text-sm font-semibold text-action hover:text-action-hover focus-visible:outline-2 focus-visible:outline-action"
        >
          {visible ? "Ocultar" : "Mostrar"}
        </button>
      }
    />
  );
}