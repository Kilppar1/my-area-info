import { z } from "zod";

// Address input typed by the user
export const addressInputSchema = z
  .string()
  .trim()
  .min(1, "Please enter an address.")
  .max(200, "Address is too long.");

// Search criteria typed by the user
export const criteriaInputSchema = z
  .string()
  .trim()
  .min(1, "Please enter a search criterion.")
  .max(100, "Search criterion is too long.");

// Search range: the input is stored as a string in React
export const searchRangeSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d)?$/, "Enter a valid number with at most one decimal place.")
  .transform(Number)
  .pipe(
    z
      .number()
      .min(0.1, "Search range must be greater than 0.")
      .max(50, "Search range cannot exceed 50 km."),
  );

// Address structure
export const addressSchema = z.object({
  id: z.string().min(1),
  address: z.string().trim().min(1).max(200),
  coordinates: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    })
    .optional(),
});

// Criteria structure
export const criteriaSchema = z.object({
  criteria: z.string().trim().min(1).max(100),
  ratingsEnabled: z.boolean(),
});

// Basic structure of imported search data
export const searchDataSchema = z
  .object({
    homeInput: z.string(),
    commuteInput: z.string(),
    criteriaInput: z.string(),

    homeAddresses: z.array(addressSchema).max(3),
    commuteAddresses: z.array(addressSchema).max(3),

    verifiedHomeId: z.string().nullable(),
    verifiedCommuteId: z.string().nullable(),

    criteriaList: z.array(criteriaSchema).max(5),

    searchRange: z.number().min(0.1).max(50).nullable(),

    hiddenResultFilters: z.array(z.string()),
    resultsListExpanded: z.boolean(),
  })
  .refine(
    (data) =>
      new Set(data.criteriaList.map((item) => item.criteria.toLowerCase()))
        .size === data.criteriaList.length,
    {
      message: "Duplicate search criteria are not allowed.",
      path: ["criteriaList"],
    },
  )
  .refine(
    (data) =>
      new Set(data.homeAddresses.map((address) => address.id)).size ===
        data.homeAddresses.length &&
      new Set(data.commuteAddresses.map((address) => address.id)).size ===
        data.commuteAddresses.length,
    {
      message: "Duplicate address IDs are not allowed.",
      path: ["homeAddresses"],
    },
  );

// Place structure
export const placeSchema = z.object({
  id: z.string(),
  osmKey: z.string().optional(),
  name: z.string(),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  color: z.string(),
  distance: z.number().optional(),
});

// CriterionResult structure
export const criterionResultSchema = z.object({
  criteria: z.string(),
  places: z.array(placeSchema),
});

// CommuteTimes structure
export const commuteTimesSchema = z.object({
  car: z.number(),
  bike: z.number(),
  walk: z.number(),
});
