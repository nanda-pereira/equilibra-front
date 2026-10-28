import { useState, type FormEvent } from "react";
import Icon from "../../../components/ui/Icon";
import Input from "../../../components/ui/Input";
import PasswordInput from "../../../components/ui/PasswordInput";
import StepHeading from "../../../components/ui/StepHeading";
import StepNav from "../../../components/ui/StepNav";
import { CheckIcon } from "../../../components/ui/icons";
import type { ProfileType, RegisterData } from "../../../modules/auth/types";
import {
  PASSWORD_RULES,
  formatBirthDate,
  formatCpf,
  isPasswordValid,
  isValidBirthDate,
  isValidCpf,
  isValidEmail,
} from "../../../modules/auth/validation";

type Field = keyof RegisterData;
type Errors = Partial<Record<Field, string>>;

const REQUIRED = "Campo obrigatório";

function validate(data: RegisterData): Errors {
  const errors: Errors = {};

  if (!data.fullName.trim()) errors.fullName = REQUIRED;
  else if (data.fullName.trim().split(/\s+/).length < 2)
    errors.fullName = "Informe nome e sobrenome";

  if (!data.birthDate) errors.birthDate = REQUIRED;
  else if (!isValidBirthDate(data.birthDate))
    errors.birthDate = "Data inválida. Use DD/MM/AAAA";

  if (!data.cpf) errors.cpf = REQUIRED;
  else if (!isValidCpf(data.cpf)) errors.cpf = "CPF inválido";

  if (!data.email.trim()) errors.email = REQUIRED;
  else if (!isValidEmail(data.email)) errors.email = "E-mail inválido";

  if (!data.password) errors.password = REQUIRED;
  else if (!isPasswordValid(data.password))
    errors.password = "Não cumpre as regras abaixo";
  if (!data.confirmPassword) errors.confirmPassword = REQUIRED;
  else if (data.confirmPassword !== data.password)
    errors.confirmPassword = "As senhas não são iguais";

  if (!data.consent) errors.consent = "Para continuar, é preciso concordar";

  return errors;
}

type DataStepProps = {
  profile: ProfileType;
  data: RegisterData;
  onChange: <K extends Field>(field: K, value: RegisterData[K]) => void;
  onBack: () => void;
  onNext: () => void;
};

export default function DataStep({
  profile,
  data,
  onChange,
  onBack,
  onNext,
}: DataStepProps) {
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  // TODO: campos de médico e cuidadores ainda não definidos.
  if (profile !== "paciente") {
    return (
      <div>
        <StepHeading
          className="mt-3"
          title="Criar conta"
          description="Os campos deste perfil ainda estão em definição. Por enquanto, só o cadastro de paciente está pronto."
        />
        <StepNav onBack={onBack} onNext={onBack} />
      </div>
    );
  }

  const errors = validate(data);
  const touch = (field: Field) => setTouched((t) => ({ ...t, [field]: true }));
  const shown = (field: Field) =>
    submitted || touched[field] ? errors[field] : undefined;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length === 0) onNext();
  }

  return (
      <form noValidate onSubmit={handleSubmit} className="flex flex-1 flex-col">      
        <StepHeading
          className="mt-3"
          title="Criar conta"
          description="Agora, preencha esses dados para criar seu acesso."
        />

      <div className="mx-auto mt-[53px] grid w-full max-w-[800px] grid-cols-1 gap-x-10 gap-y-1 min-[900px]:grid-cols-3">        
        <Input
          label="Nome completo"
          placeholder="Luiz da Silva"
          autoComplete="name"
          value={data.fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
          onBlur={() => touch("fullName")}
          error={shown("fullName")}
        />
        <Input
          label="Data de nascimento"
          placeholder="27/10/1945"
          autoComplete="bday"
          inputMode="numeric"
          maxLength={10}
          value={data.birthDate}
          onChange={(e) => onChange("birthDate", formatBirthDate(e.target.value))}
          onBlur={() => touch("birthDate")}
          error={shown("birthDate")}
        />
        <Input
          label="CPF"
          placeholder="000.000.000-00"
          autoComplete="off"
          inputMode="numeric"
          maxLength={14}
          value={data.cpf}
          onChange={(e) => onChange("cpf", formatCpf(e.target.value))}
          onBlur={() => touch("cpf")}
          error={shown("cpf")}
        />
        <Input
          label="E-mail"
          type="email"
          placeholder="luiz13@gmail.com"
          autoComplete="email"
          value={data.email}
          onChange={(e) => onChange("email", e.target.value)}
          onBlur={() => touch("email")}
          error={shown("email")}
        />
        <PasswordInput
          label="Senha"
          placeholder="••••••••"
          autoComplete="new-password"
          value={data.password}
          onChange={(e) => onChange("password", e.target.value)}
          onBlur={() => touch("password")}
          error={shown("password")}
        />
        <PasswordInput
          label="Confirmação da Senha"
          placeholder="••••••••"
          autoComplete="new-password"
          value={data.confirmPassword}
          onChange={(e) => onChange("confirmPassword", e.target.value)}
          onBlur={() => touch("confirmPassword")}
          error={shown("confirmPassword")}
        />
      </div>

      {/* Regras de senha (chips de 28px, bolinha de 4px, como no Figma) */}
      <div className="mx-auto mt-8 flex max-w-[800px] flex-wrap items-center gap-x-3 gap-y-2">
        <span id="password-rules-label" className="text-base text-ink">
          Sua senha precisa ter:
        </span>
        <ul aria-labelledby="password-rules-label" className="flex flex-wrap gap-2.5">
          {PASSWORD_RULES.map((rule) => {
            const ok = rule.test(data.password);
            return (
              <li
                key={rule.id}
                className={`inline-flex h-7 items-center gap-2 rounded-full px-3 text-sm font-medium transition-colors ${
                  ok
                    ? "bg-success-bg text-success-text"
                    : "bg-mint-100 text-action-hover"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`size-1 rounded-full ${ok ? "bg-success-text" : "bg-action"}`}
                />
                {rule.label}
                {ok && <span className="sr-only"> (atendido)</span>}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Consentimento LGPD */}
      <div className="mx-auto mt-8 max-w-[800px]">
        <label className="flex items-start gap-2.5 text-sm leading-[19px] text-ink">
          <span className="relative mt-px flex size-[18px] shrink-0">
            <input
              type="checkbox"
              checked={data.consent}
              onChange={(e) => onChange("consent", e.target.checked)}
              aria-describedby={shown("consent") ? "consent-error" : undefined}
              className="peer absolute inset-0 size-full cursor-pointer appearance-none rounded-full border border-brand bg-white checked:border-action checked:bg-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
            />
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100">
              <Icon icon={CheckIcon} size={12} strokeWidth={2.5} />
            </span>
          </span>
          <span>
            Li e concordo com os{" "}
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="font-semibold text-action-hover underline"
            >
              Termos de Uso
            </a>{" "}
            e a{" "}
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="font-semibold text-action-hover underline"
            >
              Política de Privacidade
            </a>
            , incluindo o compartilhamento de dados de saúde com meus
            cuidadores e médico responsável.
          </span>
        </label>
        {shown("consent") && (
          <p id="consent-error" className="mt-1 min-h-5 text-sm text-alert-text">
            {shown("consent")}
          </p>
        )}
      </div>

      <StepNav onBack={onBack} nextType="submit" />
    </form>
  );
}