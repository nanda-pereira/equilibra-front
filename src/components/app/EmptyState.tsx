import Icon from "../ui/Icon";
import { InfoIcon } from "../ui/icons";

type EmptyStateProps = { title: string; description?: string };

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[20px] bg-mint-100/60 px-6 py-8 text-center">
      <Icon icon={InfoIcon} size={24} className="text-action" />
      <p className="text-base font-medium text-ink">{title}</p>
      {description && <p className="max-w-md text-sm text-ink-soft">{description}</p>}
    </div>
  );
}