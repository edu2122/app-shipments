export type Store = "amazon" | "shein" | "temu" | "otro";
export type OriginCountry = "estados_unidos" | "espana";
export type Status =
  | "pendiente"
  | "en_camino"
  | "en_courier"
  | "consolidacion_solicitada"
  | "enviado_courier"
  | "recibido";

export interface Shipment {
  id: string;
  store: Store;
  origin_country: OriginCountry;
  tracking_number: string | null;
  amount_usd: number;
  order_date: string;
  status: Status;
  shipping_carrier: string | null;
  courier_prealerted: boolean;
  courier_prealerted_at: string | null;
  courier_received_at: string | null;
  consolidation_requested_at: string | null;
  shipping_quote_usd: number | null;
  email_details: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const STORE_LABELS: Record<Store, string> = {
  amazon: "Amazon",
  shein: "Shein",
  temu: "Temu",
  otro: "Otro",
};

export const ORIGIN_COUNTRY_LABELS: Record<OriginCountry, string> = {
  estados_unidos: "Estados Unidos",
  espana: "España",
};

export const STATUS_LABELS: Record<Status, string> = {
  pendiente: "Pendiente",
  en_camino: "En camino",
  en_courier: "En el courier",
  consolidacion_solicitada: "Consolidación solicitada",
  enviado_courier: "Envío internacional",
  recibido: "Recibido",
};
