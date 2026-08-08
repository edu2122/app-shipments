import { Trash2 } from "lucide-preact";
import { STORE_LABELS, type Shipment, type Status } from "../../lib/types";
import { formatCurrency, formatDate } from "../../lib/utils";
import Card from "../ui/Card";
import StatusSelect from "./StatusSelect";

interface ShipmentListProps {
  shipments: Shipment[];
  onStatusChange: (id: string, status: Status) => void;
  onDelete: (id: string) => void;
}

export default function ShipmentList({ shipments, onStatusChange, onDelete }: ShipmentListProps) {
  if (shipments.length === 0) {
    return (
      <Card class="p-10 text-center">
        <p class="text-sm text-text-muted">No hay envíos en esta categoría todavía.</p>
      </Card>
    );
  }

  return (
    <div class="space-y-3">
      {shipments.map((shipment) => (
        <Card
          key={shipment.id}
          interactive
          class="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex flex-1 flex-wrap items-center gap-x-6 gap-y-1">
            <div class="min-w-[100px]">
              <p class="text-sm font-semibold text-text-main">{STORE_LABELS[shipment.store]}</p>
              <p class="text-xs text-text-muted">{formatDate(shipment.order_date)}</p>
            </div>
            {shipment.tracking_number && (
              <p class="text-xs text-text-muted">
                Tracking: <span class="font-mono">{shipment.tracking_number}</span>
              </p>
            )}
            <p class="text-sm font-bold text-text-main">{formatCurrency(Number(shipment.amount_usd))}</p>
          </div>

          <div class="flex items-center gap-3">
            <StatusSelect
              value={shipment.status}
              onChange={(status) => onStatusChange(shipment.id, status)}
            />
            <button
              type="button"
              onClick={() => onDelete(shipment.id)}
              aria-label="Eliminar envío"
              class="rounded-lg p-2 text-text-muted transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background"
            >
              <Trash2 class="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}
