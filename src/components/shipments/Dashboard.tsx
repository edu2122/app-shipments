import { useMemo, useState } from "preact/hooks";
import { actions } from "astro:actions";
import { CheckCircle2, MapPin, Plus, Search } from "lucide-preact";
import { ORIGIN_COUNTRY_LABELS, type OriginCountry, type Shipment, type Status } from "../../lib/types";
import Button from "../ui/Button";
import SummaryCards from "./SummaryCards";
import FilterTabs, { type FilterValue } from "./FilterTabs";
import ShipmentList from "./ShipmentList";
import ShipmentFormDialog, { type ShipmentFormValues } from "./ShipmentFormDialog";

interface DashboardProps {
  initialShipments: Shipment[];
  initialError?: string | null;
}

export default function Dashboard({ initialShipments, initialError = null }: DashboardProps) {
  const [shipments, setShipments] = useState<Shipment[]>(initialShipments);
  const [filter, setFilter] = useState<FilterValue>("todos");
  const [originFilter, setOriginFilter] = useState<"todos" | OriginCountry>("todos");
  const [query, setQuery] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [notice, setNotice] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es");
    return shipments.filter((shipment) => {
      const matchesStatus = filter === "todos" || shipment.status === filter;
      const matchesOrigin = originFilter === "todos" || shipment.origin_country === originFilter;
      const searchable = [
        shipment.tracking_number,
        shipment.shipping_carrier,
        shipment.email_details,
        shipment.notes,
      ].filter(Boolean).join(" ").toLocaleLowerCase("es");
      return matchesStatus && matchesOrigin && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [shipments, filter, originFilter, query]);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 3500);
  }

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
      setError(actionError?.message || "No se pudo guardar el envío. Intenta de nuevo.");
      return;
    }

    setShipments((prev) => [data, ...prev]);
    setDialogOpen(false);
    showNotice("Pedido guardado correctamente.");
  }

  async function handleUpdate(values: ShipmentFormValues) {
    if (!editingShipment) return;
    setSubmitting(true);
    setError(null);

    const { data, error: actionError } = await actions.updateShipment({
      id: editingShipment.id,
      shipment: values,
    });
    setSubmitting(false);

    if (actionError || !data) {
      setError(actionError?.message || "No se pudieron guardar los cambios. Intenta de nuevo.");
      return;
    }

    setShipments((prev) => prev.map((shipment) => (shipment.id === data.id ? data : shipment)));
    setEditingShipment(null);
    setDialogOpen(false);
    showNotice("Cambios guardados.");
  }

  async function handleStatusChange(id: string, status: Status) {
    const previous = shipments;
    setShipments((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));

    const { error: actionError } = await actions.updateStatus({ id, status });
    if (actionError) {
      setShipments(previous);
      setError("No se pudo actualizar el estado. Intenta de nuevo.");
    } else {
      setError(null);
      showNotice("Estado actualizado.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("¿Eliminar este pedido? Esta acción no se puede deshacer.")) return;
    const previous = shipments;
    setShipments((prev) => prev.filter((s) => s.id !== id));

    const { error: actionError } = await actions.deleteShipment({ id });
    if (actionError) {
      setShipments(previous);
      setError("No se pudo eliminar el envío. Intenta de nuevo.");
    } else {
      showNotice("Pedido eliminado.");
    }
  }

  return (
    <div class="space-y-8">
      <div class="relative overflow-hidden rounded-[2rem] border border-border bg-surface px-6 py-8 shadow-soft sm:px-9">
        <div aria-hidden="true" class="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div class="relative flex flex-wrap items-end justify-between gap-6">
        <div>
          <p class="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-primary">Centro de operaciones</p>
          <h1 class="font-display text-4xl font-bold tracking-tight text-text-main sm:text-5xl">Ruta de tus pedidos</h1>
          <p class="mt-2 max-w-xl text-sm leading-6 text-text-muted">Compra, prealerta, consolida y controla el costo final desde Estados Unidos o España.</p>
        </div>
        <Button onClick={() => { setError(null); setEditingShipment(null); setDialogOpen(true); }}>
          <Plus aria-hidden="true" class="h-4 w-4" strokeWidth={2.5} />
          Nuevo envío
        </Button>
        </div>
      </div>

      <SummaryCards
        monthTotal={summary.monthTotal}
        enCamino={summary.enCamino}
        enCourier={summary.enCourier}
        quotedTotal={summary.quotedTotal}
      />

      <section aria-label="Buscar y filtrar pedidos" class="space-y-3">
        <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <label class="relative block">
            <span class="sr-only">Buscar pedidos</span>
            <Search aria-hidden="true" class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={query}
              onInput={(event) => setQuery(event.currentTarget.value)}
              placeholder="Buscar tracking, transportista o notas…"
              class="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm text-text-main shadow-sm placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </label>
          <label class="relative block">
            <span class="sr-only">Filtrar por país de origen</span>
            <MapPin aria-hidden="true" class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <select value={originFilter} onChange={(event) => setOriginFilter(event.currentTarget.value as "todos" | OriginCountry)} class="w-full appearance-none rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm font-semibold text-text-main shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <option value="todos">Todos los orígenes</option>
              {(Object.keys(ORIGIN_COUNTRY_LABELS) as OriginCountry[]).map((country) => <option key={country} value={country}>{ORIGIN_COUNTRY_LABELS[country]}</option>)}
            </select>
          </label>
        </div>
        <FilterTabs value={filter} onChange={setFilter} />
      </section>

      {error && <p role="alert" class="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">{error}</p>}
      {notice && (
        <div role="status" aria-live="polite" class="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-success/20 bg-surface px-4 py-3 text-sm font-semibold text-text-main shadow-soft-hover">
          <CheckCircle2 aria-hidden="true" class="h-4 w-4 text-success" />
          {notice}
        </div>
      )}

      <ShipmentList
        shipments={filtered}
        totalCount={shipments.length}
        onStatusChange={handleStatusChange}
        onEdit={(shipment) => { setError(null); setEditingShipment(shipment); setDialogOpen(true); }}
        onDelete={handleDelete}
      />

      <ShipmentFormDialog
        open={isDialogOpen}
        submitting={isSubmitting}
        shipment={editingShipment}
        error={error}
        onClose={() => { setDialogOpen(false); setEditingShipment(null); }}
        onSubmit={editingShipment ? handleUpdate : handleCreate}
      />
    </div>
  );
}
