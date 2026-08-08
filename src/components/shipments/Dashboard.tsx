import { useMemo, useState } from "preact/hooks";
import { actions } from "astro:actions";
import { Plus } from "lucide-preact";
import type { Shipment, Status } from "../../lib/types";
import Button from "../ui/Button";
import SummaryCards from "./SummaryCards";
import FilterTabs, { type FilterValue } from "./FilterTabs";
import ShipmentList from "./ShipmentList";
import ShipmentFormDialog, { type ShipmentFormValues } from "./ShipmentFormDialog";

interface DashboardProps {
  initialShipments: Shipment[];
}

export default function Dashboard({ initialShipments }: DashboardProps) {
  const [shipments, setShipments] = useState<Shipment[]>(initialShipments);
  const [filter, setFilter] = useState<FilterValue>("todos");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "todos") return shipments;
    return shipments.filter((s) => s.status === filter);
  }, [shipments, filter]);

  const summary = useMemo(() => {
    const now = new Date();
    const monthTotal = shipments
      .filter((s) => {
        const orderDate = new Date(`${s.order_date}T00:00:00`);
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, s) => sum + Number(s.amount_usd), 0);

    return {
      monthTotal,
      enCamino: shipments.filter((s) => s.status === "en_camino").length,
      enCourier: shipments.filter((s) =>
        ["en_courier", "consolidacion_solicitada"].includes(s.status)
      ).length,
      quotedTotal: shipments.reduce(
        (sum, s) => sum + Number(s.shipping_quote_usd ?? 0),
        0
      ),
    };
  }, [shipments]);

  async function handleCreate(values: ShipmentFormValues) {
    setSubmitting(true);
    setError(null);

    const { data, error: actionError } = await actions.createShipment(values);
    setSubmitting(false);

    if (actionError || !data) {
      setError("No se pudo guardar el envío. Intenta de nuevo.");
      return;
    }

    setShipments((prev) => [data, ...prev]);
    setDialogOpen(false);
  }

  async function handleUpdate(values: ShipmentFormValues) {
    if (!editingShipment) return;
    setSubmitting(true);
    setError(null);

    const { data, error: actionError } = await actions.updateShipment({
      id: editingShipment.id,
      ...values,
    });
    setSubmitting(false);

    if (actionError || !data) {
      setError("No se pudieron guardar los cambios. Intenta de nuevo.");
      return;
    }

    setShipments((prev) => prev.map((shipment) => (shipment.id === data.id ? data : shipment)));
    setEditingShipment(null);
    setDialogOpen(false);
  }

  async function handleStatusChange(id: string, status: Status) {
    const previous = shipments;
    setShipments((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));

    const { error: actionError } = await actions.updateStatus({ id, status });
    if (actionError) {
      setShipments(previous);
      setError("No se pudo actualizar el estado. Intenta de nuevo.");
    }
  }

  async function handleDelete(id: string) {
    const previous = shipments;
    setShipments((prev) => prev.filter((s) => s.id !== id));

    const { error: actionError } = await actions.deleteShipment({ id });
    if (actionError) {
      setShipments(previous);
      setError("No se pudo eliminar el envío. Intenta de nuevo.");
    }
  }

  return (
    <div class="space-y-8">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight text-text-main sm:text-4xl">
            Mis{" "}
            <span class="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              envíos
            </span>
          </h1>
          <p class="mt-1 text-sm text-text-muted">Amazon, Shein, Temu y más — de un vistazo.</p>
        </div>
        <Button onClick={() => { setEditingShipment(null); setDialogOpen(true); }}>
          <Plus class="h-4 w-4" strokeWidth={2.5} />
          Nuevo envío
        </Button>
      </div>

      <SummaryCards
        monthTotal={summary.monthTotal}
        enCamino={summary.enCamino}
        enCourier={summary.enCourier}
        quotedTotal={summary.quotedTotal}
      />

      <FilterTabs value={filter} onChange={setFilter} />

      {error && <p class="text-sm font-medium text-danger">{error}</p>}

      <ShipmentList
        shipments={filtered}
        onStatusChange={handleStatusChange}
        onEdit={(shipment) => { setEditingShipment(shipment); setDialogOpen(true); }}
        onDelete={handleDelete}
      />

      <ShipmentFormDialog
        open={isDialogOpen}
        submitting={isSubmitting}
        shipment={editingShipment}
        onClose={() => { setDialogOpen(false); setEditingShipment(null); }}
        onSubmit={editingShipment ? handleUpdate : handleCreate}
      />
    </div>
  );
}
