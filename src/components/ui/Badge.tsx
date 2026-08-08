import type { ComponentChildren, JSX } from "preact";
import { cn } from "../../lib/utils";

interface BadgeProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  tone?: "indigo" | "emerald" | "amber" | "slate";
  children: ComponentChildren;
}

const toneClasses: Record<NonNullable<BadgeProps["tone"]>, string> = {
  indigo: "bg-primary/10 text-primary",
  emerald: "bg-success/10 text-success",
  amber: "bg-warning/10 text-warning",
  slate: "bg-slate-100 text-text-muted dark:bg-slate-800",
};

export default function Badge({ tone = "slate", class: className, children, ...rest }: BadgeProps) {
  return (
    <span
      class={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        toneClasses[tone],
        className as string
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
