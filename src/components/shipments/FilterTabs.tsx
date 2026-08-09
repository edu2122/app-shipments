import { cn } from "../../lib/utils";
import { STATUS_LABELS, type Status } from "../../lib/types";

export type FilterValue = "todos" | Status;

interface FilterTabsProps {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}

const options: { value: FilterValue; label: string }[] = [
  { value: "todos", label: "Todos" },
  ...(Object.keys(STATUS_LABELS) as Status[]).map((value) => ({ value, label: STATUS_LABELS[value] })),
];

export default function FilterTabs({ value, onChange }: FilterTabsProps) {
  return (
    <div role="group" aria-label="Filtrar por estado" class="flex w-full gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1.5 shadow-sm sm:w-fit sm:flex-wrap">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          class={cn(
            "shrink-0 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background",
            value === option.value ? "bg-primary/10 text-primary" : "text-text-muted hover:text-text-main"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
