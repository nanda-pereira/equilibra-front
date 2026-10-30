export type Status = "stable" | "attention" | "alert" | "info";
export type AiLevel = "NORMAL" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export const STATUS_LABEL: Record<Status, string> = {
  stable: "Estável",
  attention: "Atenção",
  alert: "Alerta",
  info: "Informação",
};

// TODO: mapeamento PROVISÓRIO dos 5 níveis da API para os 3 do design; confirmar com o backend
export function statusFromLevel(level: AiLevel): Status {
  if (level === "NORMAL" || level === "LOW") return "stable";
  if (level === "MEDIUM") return "attention";
  return "alert";
}