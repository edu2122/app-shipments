import { defineAction, ActionError } from "astro:actions";
import { z } from "zod";

const storeEnum = z.enum(["amazon", "shein", "temu", "otro"]);
const statusEnum = z.enum(["pendiente", "en_camino", "recibido"]);

export const server = {
  createShipment: defineAction({
    input: z.object({
      store: storeEnum,
      trackingNumber: z.string().trim().optional(),
      amountUsd: z.number().positive(),
      orderDate: z.string(),
    }),
    handler: async (input, context) => {
      const { supabase, user } = context.locals;
      if (!user) throw new ActionError({ code: "UNAUTHORIZED" });

      const { data, error } = await supabase
        .from("shipments")
        .insert({
          user_id: user.id,
          store: input.store,
          tracking_number: input.trackingNumber || null,
          amount_usd: input.amountUsd,
          order_date: input.orderDate,
        })
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
