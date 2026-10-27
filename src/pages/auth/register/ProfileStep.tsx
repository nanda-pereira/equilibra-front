import { useState } from "react";
import Button from "../../../components/ui/Button";
import ArrowRightIcon from "../../../components/ui/ArrowRightIcon";
import type { ProfileType } from "../../../modules/auth/types";

const PROFILES: { value: ProfileType; title: string; description: string }[] = [
  {
    value: "paciente",
    title: "Paciente",
    description: "Quero acompanhar minha saúde com segurança e autonomia.",
  },
  {
    value: "medico",
    title: "Médico",
    description: "Acompanho pacientes clinicamente e quero gerenciá-los.",
  },
  {
    value: "cuidador-clinico",
    title: "Cuidador clínico",
    description: "Sou cuidador e monitoro pacientes clinicamente.",
  },
  {
    value: "cuidador-domiciliar",
    title: "Cuidador domiciliar",
    description: "Sou um cuidador familiar, responsável domesticamente.",
  },
];

type ProfileStepProps = {
  value: ProfileType | null;
  onChange: (value: ProfileType) => void;
  onNext: () => void;
  backHref: string;
};

export default function ProfileStep({
  value,
  onChange,
  onNext,
  backHref,
}: ProfileStepProps) {
  const [showError, setShowError] = useState(false);

  function handleNext() {
    if (!value) {
      setShowError(true);
      return;
    }
    onNext();
  }

  return (
    <div>
      <p
        id="profile-question"
        className="mx-auto mt-4 max-w-[640px] text-center text-base text-ink md:text-lg"
      >
        Para começarmos, primeiro, nos conte: em qual desses perfis você se
        encaixa mais?
      </p>

      <fieldset
        aria-describedby="profile-question"
        className="mx-auto mt-10 min-w-0 max-w-[880px]"
      >
        <legend className="sr-only">Perfil</legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {PROFILES.map((profile) => (
            <label
              key={profile.value}
              className="relative flex cursor-pointer flex-col items-center gap-4 rounded-card border border-mint-200 bg-white/60 px-5 py-8 text-center backdrop-blur-sm transition-shadow hover:shadow-[0_8px_32px_rgba(36,116,119,0.12)] has-[:checked]:shadow-[0_8px_32px_rgba(36,116,119,0.12)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-action lg:min-h-[280px]"
            >
              <input
                type="radio"
                name="profile"
                value={profile.value}
                checked={value === profile.value}
                onChange={() => {
                  onChange(profile.value);
                  setShowError(false);
                }}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className="size-[60px] rounded-full bg-[#ebebeb]"
              />
              <span className="text-base font-medium text-ink md:text-lg">
                {profile.title}
              </span>
              <span className="text-sm text-ink-soft">
                {profile.description}
              </span>
            </label>
          ))}
        </div>

        {showError && (
          <p role="alert" className="mt-4 text-center text-sm text-alert-text">
            Escolha um perfil para continuar.
          </p>
        )}
      </fieldset>

      <div className="mx-auto mt-10 flex max-w-[880px] flex-col-reverse gap-4 sm:grid sm:grid-cols-2 sm:justify-items-center">
        <Button
          variant="outline"
          href={backHref}
          className="w-full px-6! sm:w-auto"
        >
          <span aria-hidden="true" className="inline-flex rotate-180">
            <ArrowRightIcon />
          </span>
          Voltar
        </Button>
        <Button
          variant="outline"
          withArrow
          onClick={handleNext}
          className="w-full px-6! sm:w-auto"
        >
          Próximo
        </Button>
      </div>
    </div>
  );
}