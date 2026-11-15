
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import Icon from "../ui/Icon";
import { CloseIcon } from "../ui/icons";

const ModalDialogContext =
  createContext<HTMLDialogElement | null>(null);

export function useModalDialog() {
  return useContext(ModalDialogContext);
}

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

export default function Modal({
  open,
  title,
  onClose,
  children,
  className = "",
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;

    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="modal-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) {
          onClose();
        }
      }}
      className={`m-auto max-h-[92dvh] w-[min(96vw,760px)] overflow-y-auto overscroll-contain rounded-[28px] border border-white bg-white p-0 text-ink shadow-[0_24px_64px_rgba(36,116,119,0.25)] backdrop:bg-deep/40 backdrop:backdrop-blur-sm ${className}`}
    >
      {open && (
        <ModalDialogContext.Provider value={ref.current}>
          <div className="p-5 sm:p-7 lg:p-8">
            <div className="mb-6 flex items-start justify-between gap-4 sm:mb-7">
              <h2
                id="modal-title"
                className="text-2xl font-medium text-deep sm:text-3xl"
              >
                {title}
              </h2>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="flex size-11 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-mint-100 focus-visible:outline-2 focus-visible:outline-action"
              >
                <Icon icon={CloseIcon} size={22} />
              </button>
            </div>

            {children}
          </div>
        </ModalDialogContext.Provider>
      )}
    </dialog>
  );
}
