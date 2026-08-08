import { useEffect, useState } from "preact/hooks";
import { X } from "lucide-preact";
import { STORE_LABELS, type Store } from "../../lib/types";
import { buttonClasses, cn, inputClasses, labelClasses } from "../../lib/utils";

export interface ShipmentFormValues {
  store: Store;
  trackingNumber: string;
  amountUsd: number;
  orderDate: string;
}

interface ShipmentFormDialogProps {
  open: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: ShipmentFormValues) => void;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function ShipmentFormDialog({ open, submitting, onClose, onSubmit }: ShipmentFormDialogProps) {
  const [store, setStore] = useState<Store>("amazon");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [amountUsd, setAmountUsd] = useState("");
  const [orderDate, setOrderDate] = useState(today());

  useEffect(() => {
    if (open) {
      setStore("amazon");
      setTrackingNumber("");
      setAmountUsd("");
      setOrderDate(today());
    }
  }, [open]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(event: Event) {
    event.preventDefault();
    const amount = Number(amountUsd);
    if (!amount || amount <= 0 || !orderDate) return;
    onSubmit({ store, trackingNumber, amountUsd: amount, orderDate });
  }

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
      <div class="w-full max-w-md rounded-xl border border-slate-100 bg-surface p-6 shadow-soft-hover dark:border-slate-800">
        <div class="mb-5 flex items-center justify-between">
          <h2 class="text-lg font-bold text-text-main">Nuevo envío</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            class="rounded-lg p-1.5 text-text-muted hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background dark:hover:bg-slate-800"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <form class="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label class={labelClasses()} for="store">
              Tienda
            </label>
            <select
              id="store"
              class={cn(inputClasses(), "mt-1.5")}
              value={store}
              onChange={(e) => setStore((e.target as HTMLSelectElement).value as Store)}
            >
              {(Object.keys(STORE_LABELS) as Store[]).map((key) => (
                <option key={key} value={key}>
                  {STORE_LABELS[key]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label class={labelClasses()} for="tracking">
              Número de tracking
            </label>
            <input
              id="tracking"
              class={cn(inputClasses(), "mt-1.5")}
              value={trackingNumber}
              onInput={(e) => setTrackingNumber((e.target as HTMLInputElement).value)}
              placeholder="Opcional"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class={labelClasses()} for="amount">
                Monto (USD)
              </label>
              <input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                required
                class={cn(inputClasses(), "mt-1.5")}
                value={amountUsd}
                onInput={(e) => setAmountUsd((e.target as HTMLInputElement).value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <label class={labelClasses()} for="order-date">
                Fecha del pedido
              </label>
              <input
                id="order-date"
                type="date"
                required
                class={cn(inputClasses(), "mt-1.5")}
                value={orderDate}
                onInput={(e) => setOrderDate((e.target as HTMLInputElement).value)}
              />
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} class={buttonClasses("secondary")}>
              Cancelar
            </button>
            <button type="submit" disabled={submitting} class={buttonClasses("primary")}>
              {submitting ? "Guardando..." : "Guardar envío"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
