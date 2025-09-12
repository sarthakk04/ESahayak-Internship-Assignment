import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/apiResponse";
import { ApiError } from "@/utils/apiError";
import { buyerCreateSchema } from "@/validations/buyer";
import { db } from "@/db";
import { buyers } from "@/db/schema";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

export const POST = asyncHandler(async (req: NextRequest) => {
  const body = await req.json();

  // Validate input
  const parsed = buyerCreateSchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0].message);
  }

  const { email } = parsed.data;

  const data = parsed.data;

  if (email) {
    const [existing] = await db
      .select()
      .from(buyers)
      .where(eq(buyers.email, email))
      .limit(1);
    if (existing) {
      throw new ApiError(400, "Buyer with this email already exists");
    }
  }

  // TODO: Replace with real auth once we add NextAuth
  const ownerId = randomUUID();

  // Insert into DB
  const [buyer] = await db
    .insert(buyers)
    .values({ ...data, ownerId })
    .returning();

  return NextResponse.json(new ApiResponse(true, "Buyer created", buyer), {
    status: 201,
  });
});
