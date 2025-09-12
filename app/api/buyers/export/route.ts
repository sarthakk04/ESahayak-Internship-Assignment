// app/api/buyers/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { buyers } from "@/db/schema";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { asyncHandler } from "@/utils/asyncHandler";
import { stringify } from "csv-stringify/sync";

export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  // Filters
  const search = searchParams.get("search") || "";
  const city = searchParams.get("city");
  const propertyType = searchParams.get("propertyType");
  const status = searchParams.get("status");
  const timeline = searchParams.get("timeline");

  // Conditions
  const conditions = and(
    search
      ? or(
          ilike(buyers.fullName, `%${search}%`),
          ilike(buyers.email, `%${search}%`),
          ilike(buyers.phone, `%${search}%`)
        )
      : undefined,
    city ? eq(buyers.city, city as "Chandigarh" | "Mohali" | "Zirakpur" | "Panchkula" | "Other") : undefined,
    propertyType
      ? eq(
          buyers.propertyType,
          propertyType as "Apartment" | "Villa" | "Plot" | "Office" | "Retail"
        )
      : undefined,
    status && ["New", "Qualified", "Contacted", "Visited", "Negotiation", "Converted", "Dropped"].includes(status)
      ? eq(
          buyers.status,
          status as
            | "New"
            | "Qualified"
            | "Contacted"
            | "Visited"
            | "Negotiation"
            | "Converted"
            | "Dropped"
        )
      : undefined,
    timeline && ["0-3m", "3-6m", ">6m", "Exploring"].includes(timeline)
      ? eq(buyers.timeline, timeline as "0-3m" | "3-6m" | ">6m" | "Exploring")
      : undefined
  );

  // Fetch filtered buyers
  const data = await db
    .select()
    .from(buyers)
    .where(conditions)
    .orderBy(desc(buyers.updatedAt));

  // Convert to CSV
  const csv = stringify(data, {
    header: true,
    columns: [
      "fullName",
      "email",
      "phone",
      "city",
      "propertyType",
      "bhk",
      "purpose",
      "budgetMin",
      "budgetMax",
      "timeline",
      "source",
      "notes",
      "tags",
      "status",
      "updatedAt",
    ],
  });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="buyers-export.csv"`,
    },
  });
});
