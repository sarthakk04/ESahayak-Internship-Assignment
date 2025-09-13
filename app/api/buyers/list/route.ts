// app/api/buyers/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { buyers } from "@/db/schema";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/apiResponse";
import { ApiError } from "@/utils/apiError";
import { auth } from "@clerk/nextjs/server";

export const GET = asyncHandler(async (req: NextRequest) => {
  const { userId } = await auth();
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const { searchParams } = new URL(req.url);

  // Pagination
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 10;

  // Filters
  const search = searchParams.get("search") || "";
  const city = searchParams.get("city");
  const propertyType = searchParams.get("propertyType") as
    | "Apartment"
    | "Villa"
    | "Plot"
    | "Office"
    | "Retail"
    | null;
  const status = searchParams.get("status");
  const timeline = searchParams.get("timeline");

  // Conditions (ownership + filters)
  const conditions = and(
    eq(buyers.ownerId, userId), // ✅ enforce ownership
    search
      ? or(
          ilike(buyers.fullName, `%${search}%`),
          ilike(buyers.email, `%${search}%`),
          ilike(buyers.phone, `%${search}%`)
        )
      : undefined,
    city &&
      ["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"].includes(city)
      ? eq(
          buyers.city,
          city as "Chandigarh" | "Mohali" | "Zirakpur" | "Panchkula" | "Other"
        )
      : undefined,
    propertyType ? eq(buyers.propertyType, propertyType) : undefined,
    status
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

  // Count total rows for pagination
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(buyers)
    .where(conditions);

  // Fetch page data
  const data = await db
    .select()
    .from(buyers)
    .where(conditions)
    .orderBy(desc(buyers.updatedAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return NextResponse.json(
    new ApiResponse(true, "Listed Successfully", {
      data,
      pagination: {
        page,
        pageSize,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / pageSize),
      },
    })
  );
});
