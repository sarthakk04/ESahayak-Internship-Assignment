// app/api/buyers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { buyers, buyerHistory } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/apiResponse";
import { ApiError } from "@/utils/apiError";
import { buyerCreateSchema } from "@/validations/buyer";
import { randomUUID } from "crypto";
import { auth } from "@clerk/nextjs/server";
import { rateLimit } from "@/utils/rateLimiter";

// ------------------------- GET (any logged-in user can view) -------------------------
export const GET = asyncHandler(async (_req: NextRequest, { params }) => {
  const { userId } = await auth();
  if (!userId) throw new ApiError(401, "Unauthorized");

  const { id } = await params;

  const [buyer] = await db
    .select()
    .from(buyers)
    .where(eq(buyers.id, id))
    .limit(1);

  if (!buyer) throw new ApiError(404, "Buyer not found");

  return NextResponse.json(
    new ApiResponse(true, "Buyer fetched successfully", buyer)
  );
});

// ------------------------- PUT (only owner can update) -------------------------
export const PUT = asyncHandler(async (req: NextRequest, { params }) => {
  const { userId } = await auth();
  if (!userId) throw new ApiError(401, "Unauthorized");

  // 🔹 Rate limit check per user
  if (!rateLimit(userId)) {
    throw new ApiError(429, "Too many requests. Please try again later.");
  }

  const { id } = await params;
  const body = await req.json();

  // Validate input
  const parsed = buyerCreateSchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0].message);
  }
  const data = parsed.data;

  // Fetch existing buyer
  const [existing] = await db
    .select()
    .from(buyers)
    .where(and(eq(buyers.id, id), eq(buyers.ownerId, userId))) // 🔒 ownership check
    .limit(1);

  if (!existing) throw new ApiError(403, "Not authorized to update this buyer");

  // Concurrency check
  if (body.updatedAt && body.updatedAt !== existing.updatedAt.toISOString()) {
    throw new ApiError(
      409,
      "Record changed since you last viewed. Please refresh."
    );
  }

  // Diff for history

  const diff: Record<string, { old: unknown; new: unknown }> = {};
  for (const key in data) {
    if (
      data[key as keyof typeof data] !== existing[key as keyof typeof existing]
    ) {
      diff[key] = {
        old: existing[key as keyof typeof existing],
        new: data[key as keyof typeof data],
      };
    }
  }

  // ✅ Update buyer
  const [updated] = await db
    .update(buyers)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(buyers.id, id))
    .returning();

  // 📜 Insert history if changes exist
  if (Object.keys(diff).length > 0) {
    await db.insert(buyerHistory).values({
      id: randomUUID(),
      buyerId: id,
      changedBy: userId,
      changedAt: new Date(),
      diff,
    });
  }

  return NextResponse.json(
    new ApiResponse(true, "Buyer updated successfully", updated)
  );
});

// ------------------------- DELETE (only owner can delete) -------------------------
export const DELETE = asyncHandler(async (_req: NextRequest, { params }) => {
  const { userId } = await auth();
  if (!userId) throw new ApiError(401, "Unauthorized");

  // 🔹 Rate limit check per user
  if (!rateLimit(userId)) {
    throw new ApiError(429, "Too many requests. Please try again later.");
  }

  const { id } = await params;

  const [existing] = await db
    .select()
    .from(buyers)
    .where(and(eq(buyers.id, id), eq(buyers.ownerId, userId)))
    .limit(1);

  if (!existing) {
    throw new ApiError(403, "Not authorized to delete this buyer");
  }

  // Delete buyer
  await db.delete(buyers).where(eq(buyers.id, id));

  // Insert into history (audit trail)
  await db.insert(buyerHistory).values({
    id: randomUUID(),
    buyerId: existing.id,
    changedBy: userId,
    changedAt: new Date(),
    diff: { deleted: true, ...existing }, // store old values + mark deleted
  });

  return NextResponse.json(new ApiResponse(true, "Buyer deleted successfully"));
});
