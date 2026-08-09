import { STATUS_LABELS, type Status } from "../../lib/types";
import { cn } from "../../lib/utils";

interface StatusSelectProps {
  label?: string;
  value: Status;
  onChange: (value: Status) => void;
}

const toneByStatus: Record<Status, string> = {
  pendiente: "bg-warning/10 text-warning border-warning/20",
  en_camino: "bg-primary/10 text-primary border-primary/20",
  en_courier: "bg-secondary/10 text-secondary border-secondary/20",
  consolidacion_solicitada: "bg-warning/10 text-warning border-warning/20",
  enviado_courier: "bg-primary/10 text-primary border-primary/20",
  recibido: "bg-success/10 text-success border-success/20",
};

export default function StatusSelect({ label = "Cambiar estado del envío", value, onChange }: StatusSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange((e.target as HTMLSelectElement).value as Status)}
      aria-label={label}
      class={cn(
        "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        toneByStatus[value]
      )}
    >
      {(Object.keys(STATUS_LABELS) as Status[]).map((status) => (
        <option key={status} value={status}>
          {STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
}
