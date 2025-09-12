import { z } from "zod";

export const buyerSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().regex(/^\d{10,15}$/, "Phone must be 10–15 digits"),
  city: z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]),
  propertyType: z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]),
  bhk: z.enum(["1", "2", "3", "4", "Studio"]).optional(),
  purpose: z.enum(["Buy", "Rent"]),
  budgetMin: z.number().int().positive().optional(),
  budgetMax: z.number().int().positive().optional(),
  timeline: z.enum(["0-3m", "3-6m", ">6m", "Exploring"]),
  source: z.enum(["Website", "Referral", "Walk-in", "Call", "Other"]),
  status: z
    .enum([
      "New",
      "Qualified",
      "Contacted",
      "Visited",
      "Negotiation",
      "Converted",
      "Dropped",
    ])
    .default("New"),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
});

// Extra refinement: budgetMax >= budgetMin
export const buyerCreateSchema = buyerSchema.refine(
  (data) => {
    if (data.budgetMin && data.budgetMax) {
      return data.budgetMax >= data.budgetMin;
    }
    return true;
  },
  { message: "budgetMax must be ≥ budgetMin", path: ["budgetMax"] }
);
