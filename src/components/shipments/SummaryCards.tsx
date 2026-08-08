import { DollarSign, Truck, PackageCheck } from "lucide-preact";
import Card from "../ui/Card";
import { formatCurrency } from "../../lib/utils";

interface SummaryCardsProps {
  monthTotal: number;
  enCamino: number;
  recibidos: number;
}

export default function SummaryCards({ monthTotal, enCamino, recibidos }: SummaryCardsProps) {
  const items = [
    { label: "Gastado este mes", value: formatCurrency(monthTotal), icon: DollarSign },
    { label: "En camino", value: String(enCamino), icon: Truck },
    { label: "Recibidos", value: String(recibidos), icon: PackageCheck },
  ];

  return (
    <div class="grid gap-4 sm:grid-cols-3">
      {items.map(({ label, value, icon: Icon }) => (
        <Card key={label} class="p-5">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon class="h-6 w-6" strokeWidth={2} />
            </div>
            <div>
              <p class="text-sm font-medium text-text-muted">{label}</p>
              <p class="bg-gradient-to-r from-primary to-secondary bg-clip-text text-2xl font-extrabold text-transparent">
                {value}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
