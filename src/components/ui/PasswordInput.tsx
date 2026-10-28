import { useState, type ComponentProps } from "react";
import Input from "./Input";
import Icon from "./Icon";
import { EyeIcon, EyeOffIcon } from "./icons";

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
          className="flex size-9 items-center justify-center rounded-full text-ink-soft hover:text-action focus-visible:outline-2 focus-visible:outline-action"
        >
          <Icon icon={visible ? EyeOffIcon : EyeIcon} size={20} />
        </button>
      }
    />
  );
}