
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon";
import { ChevronDownIcon } from "./icons";

type SelectOption =
  | string
  | {
      label: string;
      value: string;
    };

type SelectProps = {
  label: string;
  options: SelectOption[];
  value?: string;
  onChange?: (event: { target: { value: string } }) => void;
  placeholder?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  portalContainer?: HTMLElement | null;
};

type MenuPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

export default function Select({
  label,
  options,
  value = "",
  onChange,
  placeholder = "Selecione",
  error,
  className = "",
  disabled = false,
  required = false,
  name,
  portalContainer,
}: SelectProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const listId = `${id}-listbox`;

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState<MenuPosition | null>(null);

  const normalizedOptions = options.map((option) =>
    typeof option === "string"
      ? { label: option, value: option }
      : option,
  );

  const selectedOption = normalizedOptions.find(
    (option) => option.value === value,
  );

  function updatePosition() {
    const rect = triggerRef.current?.getBoundingClientRect();

    if (!rect) return;

    const gap = 8;
    const viewportPadding = 12;
    const spaceBelow =
      window.innerHeight - rect.bottom - gap - viewportPadding;
    const spaceAbove = rect.top - gap - viewportPadding;

    const openAbove =
      spaceBelow < 180 && spaceAbove > spaceBelow;

    const availableSpace = Math.max(
      100,
      openAbove ? spaceAbove : spaceBelow,
    );

    const maxHeight = Math.min(240, availableSpace);

    setPosition({
      top: openAbove
        ? Math.max(
            viewportPadding,
            rect.top - gap - maxHeight,
          )
        : rect.bottom + gap,
      left: Math.max(
        viewportPadding,
        Math.min(
          rect.left,
          window.innerWidth - rect.width - viewportPadding,
        ),
      ),
      width: Math.min(
        rect.width,
        window.innerWidth - viewportPadding * 2,
      ),
      maxHeight,
    });
  }

  function openMenu() {
    if (disabled || normalizedOptions.length === 0) return;

    const selectedIndex = normalizedOptions.findIndex(
      (option) => option.value === value,
    );

    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    updatePosition();
    setIsOpen(true);
  }

  function selectOption(optionValue: string) {
    onChange?.({ target: { value: optionValue } });
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    function handleOutsideClick(event: PointerEvent) {
      const target = event.target as Node;

      if (
        !rootRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    function handleViewportChange() {
      updatePosition();
    }

    document.addEventListener("pointerdown", handleOutsideClick);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener(
        "scroll",
        handleViewportChange,
        true,
      );
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      optionRefs.current[activeIndex]?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [activeIndex, isOpen]);

  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
  ) {
    if (disabled) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (!isOpen) {
        openMenu();
      } else {
        setActiveIndex((current) =>
          Math.min(current + 1, normalizedOptions.length - 1),
        );
      }
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      if (!isOpen) {
        openMenu();
      } else {
        setActiveIndex((current) => Math.max(current - 1, 0));
      }
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (!isOpen) {
        openMenu();
      } else {
        const option = normalizedOptions[activeIndex];

        if (option) selectOption(option.value);
      }
    }

    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      setIsOpen(false);
    }

    if (event.key === "Home" && isOpen) {
      event.preventDefault();
      setActiveIndex(0);
    }

    if (event.key === "End" && isOpen) {
      event.preventDefault();
      setActiveIndex(normalizedOptions.length - 1);
    }

    if (event.key === "Tab") {
      setIsOpen(false);
    }
  }

  const menuContainer =
    portalContainer ??
    (typeof document !== "undefined" ? document.body : null);

  return (
    <div
      ref={rootRef}
      className={`flex w-full flex-col ${className}`}
    >
      <label
        id={`${id}-label`}
        htmlFor={`${id}-trigger`}
        className="mb-2.5 text-base text-ink"
      >
        {label}
        {required && (
          <span className="ml-1 text-alert-text">*</span>
        )}
      </label>

      {name && (
        <input type="hidden" name={name} value={value} />
      )}

      <div className="relative">
        <button
          ref={triggerRef}
          id={`${id}-trigger`}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-labelledby={`${id}-label`}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          onClick={() => {
            if (isOpen) {
              setIsOpen(false);
            } else {
              openMenu();
            }
          }}
          onKeyDown={handleKeyDown}
          className={`flex h-11 w-full items-center justify-between gap-3 rounded-full border bg-transparent px-6 text-left text-sm text-ink transition-colors placeholder:text-placeholder hover:bg-mint-100/60 focus:border-action focus:bg-white/60 focus:outline-none focus:ring-4 focus:ring-action/15 ${
            disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
          } ${
            error
              ? "border-[1.5px] border-alert-text"
              : "border-brand"
          }`}
        >
          <span
            className={
              selectedOption ? "text-ink" : "text-placeholder"
            }
          >
            {selectedOption?.label ?? placeholder}
          </span>

          <span
            aria-hidden="true"
            className={`shrink-0 text-ink-soft transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <Icon icon={ChevronDownIcon} size={18} />
          </span>
        </button>
      </div>

      {isOpen && position && menuContainer &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              width: position.width,
              zIndex: 100000,
            }}
            className="overflow-hidden rounded-[24px] border border-[#DCEAE8] bg-white p-2 shadow-[0_16px_40px_rgba(18,63,66,0.14)]"
          >
            <ul
              id={listId}
              role="listbox"
              aria-labelledby={`${id}-label`}
              style={{ maxHeight: position.maxHeight }}
              className="overflow-y-auto overscroll-contain"
            >
              {normalizedOptions.map((option, index) => {
                const isSelected = option.value === value;
                const isActive = index === activeIndex;

                return (
                  <li key={option.value} role="presentation">
                    <button
                      ref={(element) => {
                        optionRefs.current[index] = element;
                      }}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      tabIndex={-1}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => selectOption(option.value)}
                      className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-[16px] px-4 py-3 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-action ${
                        isSelected
                          ? "bg-[#E5F2F0] font-medium text-[#123F42]"
                          : isActive
                            ? "bg-[#F4F9F8] text-ink"
                            : "text-ink hover:bg-[#F4F9F8]"
                      }`}
                    >
                      <span className="break-words">
                        {option.label}
                      </span>

                      {isSelected && (
                        <span
                          className="shrink-0 text-action"
                          aria-hidden="true"
                        >
                          <Icon icon={ChevronDownIcon} size={16} />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>,
          menuContainer,
        )}

      <p
        id={errorId}
        aria-live="polite"
        className="mt-1 min-h-5 text-sm text-alert-text"
      >
        {error || ""}
      </p>
    </div>
  );
}
