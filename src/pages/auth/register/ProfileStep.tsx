import { useState } from "react";
import Icon from "../../../components/ui/Icon";
import StepHeading from "../../../components/ui/StepHeading";
import StepNav from "../../../components/ui/StepNav";
import {
  ClinicalCaregiverIcon,
  DoctorIcon,
  HomeCaregiverIcon,
  PatientIcon,
} from "../../../components/ui/icons";
import type { ProfileType } from "../../../modules/auth/types";

const PROFILES = [
  {
    value: "paciente",
    title: "Paciente",
    description: "Quero acompanhar minha saúde com segurança e autonomia.",
    icon: PatientIcon,
  },
  {
    value: "medico",
    title: "Médico",
    description: "Acompanho pacientes clinicamente e quero gerenciá-los.",
    icon: DoctorIcon,
  },
  {
    value: "cuidador-clinico",
    title: "Cuidador clínico",
    description: "Sou cuidador e monitoro pacientes clinicamente.",
    icon: ClinicalCaregiverIcon,
  },
  {
    value: "cuidador-domiciliar",
    title: "Cuidador domiciliar",
    description: "Sou um cuidador familiar, responsável domesticamente.",
    icon: HomeCaregiverIcon,
  },
] satisfies {
  value: ProfileType;
  title: string;
  description: string;
  icon: typeof PatientIcon;
}[];

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
      <StepHeading
        className="mt-3"
        title="Criar conta"
        descriptionId="profile-question"
        description="Para começarmos, primeiro, nos conte: em qual desses perfis você se encaixa mais?"
      />

      <fieldset
        aria-describedby="profile-question"
        className="mx-auto mt-10 min-w-0 max-w-[880px]"
      >
        <legend className="sr-only">Perfil</legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {PROFILES.map((profile) => (
            <label
              key={profile.value}
              className="relative flex cursor-pointer flex-col items-center gap-4 rounded-card border border-mint-200 bg-white/60 px-5 py-8 text-center backdrop-blur-sm transition-shadow hover:shadow-[0_8px_32px_rgba(36,116,119,0.12)] has-[:checked]:shadow-[0_12px_40px_rgba(36,116,119,0.32)] has-[:checked]:hover:shadow-[0_12px_40px_rgba(36,116,119,0.32)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-action lg:min-h-[280px]"            >
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
              <span className="flex size-[60px] items-center justify-center rounded-full bg-mint-100 text-action">
                <Icon icon={profile.icon} size={28} />
              </span>
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
          <p role="alert" className="mt-4 min-h-5 text-center text-sm text-alert-text">
            {showError ? "Escolha um perfil para continuar." : ""}
          </p>
        )}
      </fieldset>

      <StepNav backHref={backHref} onNext={handleNext} />
    </div>
  );
}