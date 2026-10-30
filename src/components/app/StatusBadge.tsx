import Icon from "../ui/Icon";
import { AlertIcon, CheckCircleIcon, InfoIcon } from "../ui/icons";
import { STATUS_LABEL, type Status } from "../../modules/app/status";

const STYLES: Record<Status, { box: string; icon: typeof CheckCircleIcon }> = {
  stable: { box: "bg-success-bg text-success-text", icon: CheckCircleIcon },
  attention: { box: "bg-attention-bg text-attention-text", icon: AlertIcon },
  alert: { box: "bg-alert-bg text-alert-text", icon: AlertIcon },
  info: { box: "bg-info-bg text-info-text", icon: InfoIcon },
};

export default function StatusBadge({ status, label }: { status: Status; label?: string }) {
  const { box, icon } = STYLES[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium ${box}`}
    >
      <Icon icon={icon} size={16} />
      {label ?? STATUS_LABEL[status]}
    </span>
  );
}