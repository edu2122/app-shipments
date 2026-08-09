import type { ComponentChildren } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { X } from "lucide-preact";
import {
  STATUS_LABELS,
  STORE_LABELS,
  ORIGIN_COUNTRY_LABELS,
  type OriginCountry,
  type Shipment,
  type Status,
  type Store,
} from "../../lib/types";
import { buttonClasses, cn, inputClasses, labelClasses } from "../../lib/utils";

export interface ShipmentFormValues {
  store: Store;
  originCountry: OriginCountry;
  trackingNumber: string;
  amountUsd: number;
  orderDate: string;
  status: Status;
  shippingCarrier: string;
  courierPrealerted: boolean;
  courierPrealertedAt: string;
  courierReceivedAt: string;
  consolidationRequestedAt: string;
  shippingQuoteUsd: number | null;
  emailDetails: string;
  notes: string;
}

interface ShipmentFormDialogProps {
  open: boolean;
  submitting: boolean;
  shipment?: Shipment | null;
  error?: string | null;
  onClose: () => void;
  onSubmit: (values: ShipmentFormValues) => void;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function ShipmentFormDialog({
  open,
  submitting,
  shipment,
  error,
  onClose,
  onSubmit,
}: ShipmentFormDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [values, setValues] = useState<ShipmentFormValues>({
    store: "amazon",
    originCountry: "estados_unidos",
    trackingNumber: "",
    amountUsd: 0,
    orderDate: today(),
    status: "pendiente",
    shippingCarrier: "",
    courierPrealerted: false,
    courierPrealertedAt: "",
    courierReceivedAt: "",
    consolidationRequestedAt: "",
    shippingQuoteUsd: null,
    emailDetails: "",
    notes: "",
  });

  useEffect(() => {
    if (!open) return;
    setValues(
      shipment
        ? {
            store: shipment.store,
            originCountry: shipment.origin_country,
            trackingNumber: shipment.tracking_number ?? "",
            amountUsd: Number(shipment.amount_usd),
            orderDate: shipment.order_date,
            status: shipment.status,
            shippingCarrier: shipment.shipping_carrier ?? "",
            courierPrealerted: shipment.courier_prealerted,
            courierPrealertedAt: shipment.courier_prealerted_at ?? "",
            courierReceivedAt: shipment.courier_received_at ?? "",
            consolidationRequestedAt: shipment.consolidation_requested_at ?? "",
            shippingQuoteUsd:
              shipment.shipping_quote_usd === null ? null : Number(shipment.shipping_quote_usd),
            emailDetails: shipment.email_details ?? "",
            notes: shipment.notes ?? "",
          }
        : {
            store: "amazon",
            originCountry: "estados_unidos",
            trackingNumber: "",
            amountUsd: 0,
            orderDate: today(),
            status: "pendiente",
            shippingCarrier: "",
            courierPrealerted: false,
            courierPrealertedAt: "",
            courierReceivedAt: "",
            consolidationRequestedAt: "",
            shippingQuoteUsd: null,
            emailDetails: "",
            notes: "",
          }
    );
  }, [open, shipment]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        )
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  function set<K extends keyof ShipmentFormValues>(key: K, value: ShipmentFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: Event) {
    event.preventDefault();
    if (values.amountUsd < 0 || !values.orderDate) return;
    onSubmit(values);
  }

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="shipment-dialog-title" aria-describedby="shipment-dialog-description" class="max-h-full w-full max-w-2xl overflow-y-auto rounded-[1.5rem] border border-border bg-surface p-5 shadow-2xl sm:p-7">
        <div class="mb-5 flex items-center justify-between">
          <div>
            <h2 id="shipment-dialog-title" class="font-display text-2xl font-bold text-text-main">
              {shipment ? "Actualizar pedido" : "Nuevo pedido"}
            </h2>
            <p id="shipment-dialog-description" class="mt-1 text-xs text-text-muted">Completa ahora lo que tengas y actualízalo después.</p>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Cerrar formulario" class="inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl text-text-muted hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <X aria-hidden="true" class="h-5 w-5" />
          </button>
        </div>

        <form class="space-y-6" onSubmit={handleSubmit} aria-busy={submitting}>
          {error && <p role="alert" class="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">{error}</p>}
          <section>
            <h3 class="mb-3 text-sm font-bold text-primary">Datos del pedido</h3>
            <div class="grid gap-4 sm:grid-cols-2">
              <Field label="Tienda" id="store">
                <select id="store" class={cn(inputClasses(), "mt-1.5")} value={values.store} onChange={(e) => set("store", (e.currentTarget as HTMLSelectElement).value as Store)}>
                  {(Object.keys(STORE_LABELS) as Store[]).map((key) => <option key={key} value={key}>{STORE_LABELS[key]}</option>)}
                </select>
              </Field>
              <Field label="Fecha del pedido" id="order-date">
                <input id="order-date" type="date" required class={cn(inputClasses(), "mt-1.5")} value={values.orderDate} onInput={(e) => set("orderDate", e.currentTarget.value)} />
              </Field>
              <Field label="País de origen" id="origin-country">
                <select id="origin-country" class={cn(inputClasses(), "mt-1.5")} value={values.originCountry} onChange={(e) => set("originCountry", e.currentTarget.value as OriginCountry)}>
                  {(Object.keys(ORIGIN_COUNTRY_LABELS) as OriginCountry[]).map((key) => <option key={key} value={key}>{ORIGIN_COUNTRY_LABELS[key]}</option>)}
                </select>
              </Field>
              <Field label="Monto de la compra (USD)" id="amount">
                <input id="amount" type="number" min="0" step="0.01" required class={cn(inputClasses(), "mt-1.5")} value={values.amountUsd || ""} onInput={(e) => set("amountUsd", Number(e.currentTarget.value))} placeholder="0.00" />
              </Field>
              <Field label="Estado" id="status">
                <select id="status" class={cn(inputClasses(), "mt-1.5")} value={values.status} onChange={(e) => set("status", e.currentTarget.value as Status)}>
                  {(Object.keys(STATUS_LABELS) as Status[]).map((key) => <option key={key} value={key}>{STATUS_LABELS[key]}</option>)}
                </select>
              </Field>
              <Field label="Número de tracking" id="tracking">
                <input id="tracking" class={cn(inputClasses(), "mt-1.5")} value={values.trackingNumber} onInput={(e) => set("trackingNumber", e.currentTarget.value)} placeholder="Ej. 1Z999AA..." />
              </Field>
              <Field label="Empresa transportista" id="carrier">
                <input id="carrier" class={cn(inputClasses(), "mt-1.5")} value={values.shippingCarrier} onInput={(e) => set("shippingCarrier", e.currentTarget.value)} placeholder="UPS, USPS, FedEx..." />
              </Field>
            </div>
          </section>

          <section class="border-t border-border pt-5">
            <h3 class="mb-3 text-sm font-bold text-primary">Courier y consolidación</h3>
            <label class="mb-4 flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3">
              <input type="checkbox" checked={values.courierPrealerted} onChange={(e) => set("courierPrealerted", e.currentTarget.checked)} class="h-4 w-4 accent-primary" />
              <span><span class="block text-sm font-semibold text-text-main">Pedido prealertado</span><span class="block text-xs text-text-muted">Ya informé este tracking a mi courier.</span></span>
            </label>
            <div class="grid gap-4 sm:grid-cols-2">
              <Field label="Fecha de prealerta" id="prealert-date"><input id="prealert-date" type="date" class={cn(inputClasses(), "mt-1.5")} value={values.courierPrealertedAt} onInput={(e) => set("courierPrealertedAt", e.currentTarget.value)} /></Field>
              <Field label="Recibido en el courier" id="courier-date"><input id="courier-date" type="date" class={cn(inputClasses(), "mt-1.5")} value={values.courierReceivedAt} onInput={(e) => set("courierReceivedAt", e.currentTarget.value)} /></Field>
              <Field label="Solicitud de consolidación" id="consolidation-date"><input id="consolidation-date" type="date" class={cn(inputClasses(), "mt-1.5")} value={values.consolidationRequestedAt} onInput={(e) => set("consolidationRequestedAt", e.currentTarget.value)} /></Field>
              <Field label="Cotización total del envío (USD)" id="quote"><input id="quote" type="number" min="0" step="0.01" class={cn(inputClasses(), "mt-1.5")} value={values.shippingQuoteUsd ?? ""} onInput={(e) => set("shippingQuoteUsd", e.currentTarget.value === "" ? null : Number(e.currentTarget.value))} placeholder="0.00" /></Field>
            </div>
          </section>

          <section class="border-t border-border pt-5">
            <h3 class="mb-3 text-sm font-bold text-primary">Correo y notas</h3>
            <div class="space-y-4">
              <Field label="Contenido del correo recibido" id="email-details"><textarea id="email-details" rows={4} class={cn(inputClasses(), "mt-1.5 resize-y")} value={values.emailDetails} onInput={(e) => set("emailDetails", e.currentTarget.value)} placeholder="Pega aquí el correo con el tracking y los detalles del transportista." /></Field>
              <Field label="Notas adicionales" id="notes"><textarea id="notes" rows={2} class={cn(inputClasses(), "mt-1.5 resize-y")} value={values.notes} onInput={(e) => set("notes", e.currentTarget.value)} placeholder="Número de casillero, instrucciones o cualquier observación." /></Field>
            </div>
          </section>

          <div class="flex justify-end gap-3 border-t border-border pt-5">
            <button type="button" onClick={onClose} class={buttonClasses("secondary")}>Cancelar</button>
            <button type="submit" disabled={submitting} class={buttonClasses("primary")}>{submitting ? "Guardando..." : shipment ? "Guardar cambios" : "Guardar pedido"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: ComponentChildren }) {
  return <div><label class={labelClasses()} for={id}>{label}</label>{children}</div>;
}
