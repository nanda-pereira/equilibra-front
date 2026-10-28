import { useState, type ReactNode } from "react";
import Icon from "../../../components/ui/Icon";
import StepHeading from "../../../components/ui/StepHeading";
import StepNav from "../../../components/ui/StepNav";
import { EyeIcon, EyeOffIcon } from "../../../components/ui/icons";
import {
  PROFILE_LABELS,
  type ProfileType,
  type RegisterData,
} from "../../../modules/auth/types";

type ReviewStepProps = {
  profile: ProfileType;
  data: RegisterData;
  onEditProfile: () => void;
  onEditData: () => void;
  onBack: () => void;
  onNext: () => void;
};

function SectionHeader({
  id,
  title,
  editLabel,
  onEdit,
}: {
  id: string;
  title: string;
  editLabel: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 id={id} className="text-lg font-medium text-deep md:text-xl">
        {title}
      </h2>
      <button
        type="button"
        onClick={onEdit}
        aria-label={editLabel}
        className="-mr-2 inline-flex min-h-11 items-center rounded-full px-2 text-base text-action underline underline-offset-4 hover:text-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
      >
        Editar
      </button>
    </div>
  );
}

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-sm font-medium text-action-hover">{label}</dt>
      <dd className="mt-1 break-words text-base text-ink">{children}</dd>
    </div>
  );
}

export default function ReviewStep({
  profile,
  data,
  onEditProfile,
  onEditData,
  onBack,
  onNext,
}: ReviewStepProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <StepHeading
        className="mt-3"
        title="Verifique seus dados"
        description="Confira as informações antes de criar sua conta. Você pode editar qualquer campo."
      />

      <div className="mx-auto mt-12 max-w-[800px]">
        <section aria-labelledby="review-profile">
          <SectionHeader
            id="review-profile"
            title="Perfil selecionado:"
            editLabel="Editar perfil selecionado"
            onEdit={onEditProfile}
          />
          <p className="mt-1 text-base text-ink">{PROFILE_LABELS[profile]}</p>
        </section>

        <hr className="my-8 border-line" />

        <section aria-labelledby="review-data">
          <SectionHeader
            id="review-data"
            title="Dados pessoais:"
            editLabel="Editar dados pessoais"
            onEdit={onEditData}
          />
          <dl className="mt-4 grid grid-cols-1 gap-x-10 gap-y-6 min-[900px]:grid-cols-3">
            <Info label="Nome completo">{data.fullName}</Info>
            <Info label="Data de nascimento">{data.birthDate}</Info>
            <Info label="CPF">{data.cpf}</Info>
            <Info label="E-mail">{data.email}</Info>
            <Info label="Senha">
              <span className="inline-flex items-center gap-1">
                <span className={showPassword ? "break-all" : "tracking-wider"}>
                  {showPassword ? data.password : "•".repeat(data.password.length)}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full text-ink-soft hover:text-action focus-visible:outline-2 focus-visible:outline-action"
                >
                  <Icon icon={showPassword ? EyeOffIcon : EyeIcon} size={20} />
                </button>
              </span>
            </Info>
          </dl>
        </section>
      </div>

      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}