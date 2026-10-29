import Button from "./Button";
import ArrowRightIcon from "./ArrowRightIcon";

type StepNavProps = {
  backHref?: string;
  onBack?: () => void;
  onNext?: () => void;
  nextType?: "button" | "submit";
  nextLabel?: string;
};

export default function StepNav({
  backHref,
  onBack,
  onNext,
  nextType = "button",
  nextLabel = "Próximo",
}: StepNavProps) {
  const sizing = "w-full px-6! sm:w-auto";

  return (
    // mt-auto empurra os botões para o fundo da área da etapa (posição fixa no desktop)
    <div className="mx-auto mt-auto flex w-full max-w-[800px] flex-col-reverse items-center gap-4 pt-10 sm:flex-row sm:justify-center sm:gap-28">
      <Button variant="outline" href={backHref} onClick={onBack} className={sizing}>
        <span aria-hidden="true" className="inline-flex rotate-180">
          <ArrowRightIcon />
        </span>
        Voltar
      </Button>
      <Button
        variant="outline"
        withArrow
        type={nextType}
        onClick={onNext}
        className={sizing}
      >
        {nextLabel}
      </Button>
    </div>
  );
}