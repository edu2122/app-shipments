import { DollarSign, Truck, Warehouse } from "lucide-preact";
import Card from "../ui/Card";
import { formatCurrency } from "../../lib/utils";

interface SummaryCardsProps {
  monthTotal: number;
  enCamino: number;
  enCourier: number;
  quotedTotal: number;
}

export default function SummaryCards({ monthTotal, enCamino, enCourier, quotedTotal }: SummaryCardsProps) {
  const items = [
    { label: "Gastado este mes", value: formatCurrency(monthTotal), icon: DollarSign },
    { label: "En camino", value: String(enCamino), icon: Truck },
    { label: "En el courier", value: String(enCourier), icon: Warehouse },
    { label: "Cotizado en envíos", value: formatCurrency(quotedTotal), icon: DollarSign },
  ];

  return (
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ label, value, icon: Icon }) => (
        <Card key={label} class="p-5">
          <div class="flex items-center gap-4">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/10 bg-primary/10 text-primary">
              <Icon aria-hidden="true" class="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <p class="text-sm font-medium text-text-muted">{label}</p>
              <p class="font-display text-2xl font-bold text-text-main">
                {value}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
