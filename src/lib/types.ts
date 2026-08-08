export type Store = "amazon" | "shein" | "temu" | "otro";
export type Status = "pendiente" | "en_camino" | "recibido";

export interface Shipment {
  id: string;
  store: Store;
  tracking_number: string | null;
  amount_usd: number;
  order_date: string;
  status: Status;
  created_at: string;
  updated_at: string;
}

export const STORE_LABELS: Record<Store, string> = {
  amazon: "Amazon",
  shein: "Shein",
  temu: "Temu",
  otro: "Otro",
};

export const STATUS_LABELS: Record<Status, string> = {
  pendiente: "Pendiente",
  en_camino: "En camino",
  recibido: "Recibido",
};
