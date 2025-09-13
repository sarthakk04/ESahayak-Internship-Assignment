// app/api/buyers/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiError } from "@/utils/apiError";
import { ApiResponse } from "@/utils/apiResponse";
import { db } from "@/db";
import { buyers } from "@/db/schema";
import { buyerSchema } from "@/validations/buyer";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { rateLimit } from "@/utils/rateLimiter";

export const POST = asyncHandler(async (req: NextRequest) => {
  const { userId } = await auth();
  if (!userId) throw new ApiError(401, "Unauthorized");

  if (!rateLimit(userId)) {
    throw new ApiError(429, "Too many requests. Please try again later.");
  }

  const body = await req.json();
  const parsed = buyerSchema.parse(body);

  const { email } = parsed;

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

  await db.insert(buyers).values({
    ...parsed,
    ownerId: userId, // 🔑 enforce ownership
  });

  return NextResponse.json(new ApiResponse(true, "Buyer created"));
});
