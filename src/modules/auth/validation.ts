export type PasswordRule = {
  id: string;
  label: string;
  test: (value: string) => boolean;
};

// Rótulos conforme o Figma (4 regras).
export const PASSWORD_RULES: PasswordRule[] = [
  { id: "length", label: "8 ou mais caracteres", test: (v) => v.length >= 8 },
  { id: "upper", label: "Letra maiúscula", test: (v) => /\p{Lu}/u.test(v) },
  { id: "lower", label: "Letra minúscula", test: (v) => /\p{Ll}/u.test(v) },
  { id: "number", label: "Número", test: (v) => /\d/.test(v) },
  // { id: "symbol", label: "Símbolo", test: (v) => /[^\p{L}\d\s]/u.test(v) },
];

export const isPasswordValid = (value: string) =>
  PASSWORD_RULES.every((rule) => rule.test(value));

export const onlyDigits = (value: string) => value.replace(/\D/g, "");

export function formatCpf(value: string) {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export function formatBirthDate(value: string) {
  return onlyDigits(value)
    .slice(0, 8)
    .replace(/^(\d{2})(\d)/, "$1/$2")
    .replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
}

export function isValidCpf(value: string) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const checkDigit = (length: number) => {
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += Number(cpf[i]) * (length + 1 - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return checkDigit(9) === Number(cpf[9]) && checkDigit(10) === Number(cpf[10]);
}

export function isValidBirthDate(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return false;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  const isRealDate =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  return isRealDate && year >= 1900 && date <= new Date();
}

export const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

// converte a data de nascimento do formato brasileiro (dd/mm/yyyy) para o formato ISO (yyyy-mm-dd)
export function brDateToIso(value: string) {
  const [day, month, year] = value.split("/");
  return `${year}-${month}-${day}`;
}