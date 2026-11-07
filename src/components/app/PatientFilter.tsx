import { PATIENTS_BASE } from "../../modules/demo/demoData";

type PatientFilterProps = {
  value: string;
  onChange: (id: string) => void;
  includeAll?: boolean;
  label?: string;
};

export default function PatientFilter({
  value,
  onChange,
  includeAll = false,
  label = "Filtrar por paciente",
}: PatientFilterProps) {
  const options = includeAll ? [{ id: "all", name: "Todos" }, ...PATIENTS_BASE] : PATIENTS_BASE;

  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2.5">
      {options.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.id)}
            className={`inline-flex h-11 items-center rounded-full px-5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action ${
              active
                ? "bg-action text-white shadow-[0_8px_20px_rgba(36,116,119,0.25)]"
                : "border border-brand text-action hover:bg-mint-100"
            }`}
          >
            {option.name}
          </button>
        );
      })}
    </div>
  );
}