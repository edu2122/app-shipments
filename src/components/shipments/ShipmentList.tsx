import { Mail, Pencil, ShieldCheck, Trash2 } from "lucide-preact";
import { ORIGIN_COUNTRY_LABELS, STORE_LABELS, type Shipment, type Status } from "../../lib/types";
import { formatCurrency, formatDate } from "../../lib/utils";
import Card from "../ui/Card";
import StatusSelect from "./StatusSelect";

interface ShipmentListProps {
  shipments: Shipment[];
  onStatusChange: (id: string, status: Status) => void;
  onEdit: (shipment: Shipment) => void;
  onDelete: (id: string) => void;
}

export default function ShipmentList({ shipments, onStatusChange, onEdit, onDelete }: ShipmentListProps) {
  if (shipments.length === 0) {
    return <Card class="p-10 text-center"><p class="text-sm text-text-muted">No hay pedidos en esta categoría todavía.</p></Card>;
  }

  return (
    <div class="space-y-3">
      {shipments.map((shipment) => (
        <Card key={shipment.id} class="p-5">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <p class="text-base font-bold text-text-main">{STORE_LABELS[shipment.store]}</p>
                {shipment.courier_prealerted && <span class="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-xs font-semibold text-success"><ShieldCheck class="h-3.5 w-3.5" />Prealertado</span>}
              </div>
              <p class="mt-1 text-xs text-text-muted">Pedido el {formatDate(shipment.order_date)}</p>

              <div class="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <Detail label="Compra" value={formatCurrency(Number(shipment.amount_usd))} />
                <Detail label="Origen" value={ORIGIN_COUNTRY_LABELS[shipment.origin_country]} />
                <Detail label="Tracking" value={shipment.tracking_number || "Sin registrar"} mono />
                <Detail label="Transportista" value={shipment.shipping_carrier || "Sin registrar"} />
                {shipment.courier_received_at && <Detail label="Llegó al courier" value={formatDate(shipment.courier_received_at)} />}
                {shipment.consolidation_requested_at && <Detail label="Consolidación solicitada" value={formatDate(shipment.consolidation_requested_at)} />}
                <Detail label="Cotización del courier" value={shipment.shipping_quote_usd === null ? "Pendiente" : formatCurrency(Number(shipment.shipping_quote_usd))} highlight={shipment.shipping_quote_usd !== null} />
              </div>

              {(shipment.email_details || shipment.notes) && (
                <details class="mt-4 rounded-lg bg-background px-3 py-2">
                  <summary class="cursor-pointer text-xs font-semibold text-primary">Ver correo y notas</summary>
                  {shipment.email_details && <div class="mt-3"><p class="flex items-center gap-1 text-xs font-semibold text-text-muted"><Mail class="h-3.5 w-3.5" />Correo recibido</p><p class="mt-1 whitespace-pre-wrap text-sm text-text-main">{shipment.email_details}</p></div>}
                  {shipment.notes && <div class="mt-3"><p class="text-xs font-semibold text-text-muted">Notas</p><p class="mt-1 whitespace-pre-wrap text-sm text-text-main">{shipment.notes}</p></div>}
                </details>
              )}
            </div>

            <div class="flex shrink-0 items-center gap-2">
              <StatusSelect value={shipment.status} onChange={(status) => onStatusChange(shipment.id, status)} />
              <button type="button" onClick={() => onEdit(shipment)} aria-label="Editar pedido" class="rounded-lg p-2 text-text-muted transition-colors hover:bg-primary/10 hover:text-primary"><Pencil class="h-4 w-4" /></button>
              <button type="button" onClick={() => onDelete(shipment.id)} aria-label="Eliminar pedido" class="rounded-lg p-2 text-text-muted transition-colors hover:bg-danger/10 hover:text-danger"><Trash2 class="h-4 w-4" /></button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function Detail({ label, value, mono = false, highlight = false }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return <div><p class="text-xs text-text-muted">{label}</p><p class={`mt-0.5 break-words font-semibold ${mono ? "font-mono text-xs" : ""} ${highlight ? "text-success" : "text-text-main"}`}>{value}</p></div>;
}
