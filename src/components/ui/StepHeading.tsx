import { useEffect, useRef, type ReactNode } from "react";

type StepHeadingProps = {
  title: string;
  description: ReactNode;
  descriptionId?: string;
  className?: string;
};

export default function StepHeading({
  title,
  description,
  descriptionId,
  className = "",
}: StepHeadingProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className={`text-center ${className}`}>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-[32px] font-medium leading-tight text-deep focus:outline-none md:text-[40px] md:leading-[56px]"
      >
        {title}
      </h1>
      <p
        id={descriptionId}
        className="mx-auto mt-2 max-w-[661px] text-base text-ink md:text-xl md:leading-[30px]"
      >
        {description}
      </p>
    </div>
  );
}