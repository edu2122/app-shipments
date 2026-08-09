import { defineAction, ActionError } from "astro:actions";
import { z } from "zod";

const storeEnum = z.enum(["amazon", "shein", "temu", "otro"]);
const originCountryEnum = z.enum(["estados_unidos", "espana"]);
const statusEnum = z.enum([
  "pendiente",
  "en_camino",
  "en_courier",
  "consolidacion_solicitada",
  "enviado_courier",
  "recibido",
]);

const optionalText = z.string().trim().max(10000).optional();
const shipmentInput = z.object({
  store: storeEnum,
  originCountry: originCountryEnum,
  trackingNumber: z.string().trim().max(200).optional(),
  amountUsd: z.number().nonnegative(),
  orderDate: z.string(),
  status: statusEnum,
  shippingCarrier: z.string().trim().max(200).optional(),
  courierPrealerted: z.boolean(),
  courierPrealertedAt: z.string().optional(),
  courierReceivedAt: z.string().optional(),
  consolidationRequestedAt: z.string().optional(),
  shippingQuoteUsd: z.number().nonnegative().nullable(),
  emailDetails: optionalText,
  notes: optionalText,
});

function toShipmentRow(input: z.infer<typeof shipmentInput>) {
  return {
    store: input.store,
    origin_country: input.originCountry,
    tracking_number: input.trackingNumber || null,
    amount_usd: input.amountUsd,
    order_date: input.orderDate,
    status: input.status,
    shipping_carrier: input.shippingCarrier || null,
    courier_prealerted: input.courierPrealerted,
    courier_prealerted_at: input.courierPrealertedAt || null,
    courier_received_at: input.courierReceivedAt || null,
    consolidation_requested_at: input.consolidationRequestedAt || null,
    shipping_quote_usd: input.shippingQuoteUsd,
    email_details: input.emailDetails || null,
    notes: input.notes || null,
  };
}

export const server = {
  createShipment: defineAction({
    input: shipmentInput,
    handler: async (input, context) => {
      const { supabase, user } = context.locals;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED" });

      const { data, error } = await supabase
        .from("shipments")
        .insert({
          user_id: user.id,
          ...toShipmentRow(input),
        })
        .select()
        .single();

      if (error) {
        throw new ActionError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
      return data;
    },
  }),

  updateShipment: defineAction({
    input: shipmentInput.extend({ id: z.string().uuid() }),
    handler: async ({ id, ...input }, context) => {
      const { supabase, user } = context.locals;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED" });

      const { data, error } = await supabase
        .from("shipments")
        .update(toShipmentRow(input))
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new ActionError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
      return data;
    },
  }),

  updateStatus: defineAction({
    input: z.object({
      id: z.string().uuid(),
      status: statusEnum,
    }),
    handler: async ({ id, status }, context) => {
      const { supabase, user } = context.locals;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED" });

      const { data, error } = await supabase
        .from("shipments")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new ActionError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
      return data;
    },
  }),

  deleteShipment: defineAction({
    input: z.object({ id: z.string().uuid() }),
    handler: async ({ id }, context) => {
      const { supabase, user } = context.locals;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED" });

      const { error } = await supabase.from("shipments").delete().eq("id", id);
      if (error) {
        throw new ActionError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
      return { id };
    },
  }),
};
