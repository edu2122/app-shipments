import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const optionalDate = z.union([
  z.literal(""),
  z.string().regex(datePattern, "Usa una fecha válida con formato AAAA-MM-DD."),
]);

export const shipmentInputSchema = z
  .object({
    store: z.enum(["amazon", "shein", "temu", "otro"]),
    originCountry: z.enum(["estados_unidos", "espana"]),
    trackingNumber: z.string().trim().max(200, "El tracking no puede superar 200 caracteres."),
    amountUsd: z.number().finite().nonnegative("El monto no puede ser negativo.").max(99_999_999),
    orderDate: z.string().regex(datePattern, "Indica una fecha de pedido válida."),
    status: z.enum([
      "pendiente",
      "en_camino",
      "en_courier",
      "consolidacion_solicitada",
      "enviado_courier",
      "recibido",
    ]),
    shippingCarrier: z.string().trim().max(200, "El transportista no puede superar 200 caracteres."),
    courierPrealerted: z.boolean(),
    courierPrealertedAt: optionalDate,
    courierReceivedAt: optionalDate,
    consolidationRequestedAt: optionalDate,
    shippingQuoteUsd: z.number().finite().nonnegative("La cotización no puede ser negativa.").max(99_999_999).nullable(),
    emailDetails: z.string().trim().max(10_000, "El correo no puede superar 10.000 caracteres."),
    notes: z.string().trim().max(5_000, "Las notas no pueden superar 5.000 caracteres."),
  })
  .strict()
  .superRefine((input, context) => {
    const dates = [
      ["courierPrealertedAt", input.courierPrealertedAt, "La prealerta"],
      ["courierReceivedAt", input.courierReceivedAt, "La recepción en el courier"],
      ["consolidationRequestedAt", input.consolidationRequestedAt, "La consolidación"],
    ] as const;

    for (const [field, value, label] of dates) {
      if (value && value < input.orderDate) {
        context.addIssue({
          code: "custom",
          path: [field],
          message: `${label} no puede ser anterior al pedido.`,
        });
      }
    }

    if (
      input.courierReceivedAt &&
      input.consolidationRequestedAt &&
      input.consolidationRequestedAt < input.courierReceivedAt
    ) {
      context.addIssue({
        code: "custom",
        path: ["consolidationRequestedAt"],
        message: "La consolidación no puede ser anterior a la recepción en el courier.",
      });
    }
  });

export type ShipmentInput = z.infer<typeof shipmentInputSchema>;
