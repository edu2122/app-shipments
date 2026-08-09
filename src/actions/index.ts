import { defineAction, ActionError } from "astro:actions";
import { z } from "zod";
import { shipmentInputSchema, type ShipmentInput } from "../lib/shipment-schema";

const statusEnum = z.enum([
  "pendiente",
  "en_camino",
  "en_courier",
  "consolidacion_solicitada",
  "enviado_courier",
  "recibido",
]);

function toShipmentRow(input: ShipmentInput) {
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
    input: shipmentInputSchema,
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
    input: z.object({ id: z.string().uuid(), shipment: shipmentInputSchema }).strict(),
    handler: async ({ id, shipment }, context) => {
      const { supabase, user } = context.locals;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED" });

      const { data, error } = await supabase
        .from("shipments")
        .update(toShipmentRow(shipment))
        .eq("id", id)
        .eq("user_id", user.id)
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
        .eq("user_id", user.id)
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

      const { error } = await supabase
        .from("shipments")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) {
        throw new ActionError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
      return { id };
    },
  }),
};
