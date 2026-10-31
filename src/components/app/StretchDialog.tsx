import { useEffect, useRef } from "react";
import { DISCLAIMER, type Stretch } from "../../modules/demo/stretches";
import SmallButton from "./SmallButton";
import StretchIllustration from "./StretchIllustration";

type StretchDialogProps = {
  stretch: Stretch | null;
  onClose: () => void;
};

export default function StretchDialog({ stretch, onClose }: StretchDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (stretch && !dialog.open) dialog.showModal();
    if (!stretch && dialog.open) dialog.close();
  }, [stretch]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="stretch-dialog-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose(); // clique no fundo escuro
      }}
      className="m-auto max-h-[90svh] w-[min(92vw,780px)] overflow-y-auto rounded-[32px] border border-white bg-white p-0 text-ink shadow-[0_24px_64px_rgba(36,116,119,0.25)] backdrop:bg-deep/40 backdrop:backdrop-blur-sm"
    >
      {stretch && (
        <div className="grid gap-6 p-6 sm:grid-cols-[260px_1fr] sm:gap-8 sm:p-8">
          <StretchIllustration
            pose={stretch.pose}
            label={stretch.illustrationLabel}
            className="w-full max-w-[260px] justify-self-center"
          />

          <div className="flex flex-col gap-5">
            <div>
              <span className="inline-flex rounded-full bg-mint-100 px-3 py-1 text-sm font-medium text-action-hover">
                {stretch.duration}
              </span>
              <h2 id="stretch-dialog-title" className="mt-3 text-2xl font-medium text-deep">
                {stretch.title}
              </h2>
              <p className="mt-2 text-base text-ink-soft">{stretch.benefit}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-deep">Como fazer</h3>
              <ol className="mt-3 flex flex-col gap-3">
                {stretch.steps.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-mint-100 text-sm font-semibold text-action"
                    >
                      {index + 1}
                    </span>
                    <span className="text-base text-ink">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-medium text-deep">Cuidados</h3>
              <ul className="mt-2 list-disc pl-5 text-base text-ink marker:text-brand">
                {stretch.care.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <p className="rounded-[20px] bg-info-bg px-4 py-3 text-sm text-info-text">
              {DISCLAIMER}
            </p>

            <div>
              <SmallButton variant="solid" onClick={onClose}>
                Fechar
              </SmallButton>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}