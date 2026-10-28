import Button from "../../../components/ui/Button";
import StepHeading from "../../../components/ui/StepHeading";

type WelcomeStepProps = {
  firstName: string;
};

export default function WelcomeStep({ firstName }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-center">
      <StepHeading
        className="mt-16 md:mt-28"
        title={`Boas-vindas, ${firstName}!`}
        description="Sua conta foi criada com sucesso. Você está a um passo de um cuidado mais seguro e preventivo."
      />

      {/* TODO: href temporário; apontar para login/dashboard quando existirem */}
      <Button
        variant="primary"
        href="/"
        withArrow
        className="mt-14 w-[246px] gap-6! bg-action! hover:bg-action-hover!"
      >
        Começar agora
      </Button>
    </div>
  );
}