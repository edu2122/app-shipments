export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function buttonClasses(variant: "primary" | "secondary" = "primary"): string {
  const base =
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none";

  if (variant === "secondary") {
    return cn(
      base,
      "rounded-lg bg-white text-slate-700 border border-border hover:bg-slate-50 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-700"
    );
  }

  return cn(
    base,
    "rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-button hover:-translate-y-0.5 hover:shadow-lg"
  );
}

export function cardClasses(interactive = false): string {
  return cn(
    "rounded-xl border border-slate-100 bg-surface shadow-soft transition-all duration-200 dark:border-slate-800",
    interactive && "hover:-translate-y-1 hover:shadow-soft-hover"
  );
}

export function inputClasses(): string {
  return "w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text-main placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background focus-visible:border-primary transition-colors dark:bg-slate-900";
}

export function labelClasses(): string {
  return "text-sm font-semibold text-slate-700 dark:text-slate-300";
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${dateStr}T00:00:00`));
}
