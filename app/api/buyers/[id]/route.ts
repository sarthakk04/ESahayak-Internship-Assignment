// app/api/buyers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { buyers, buyerHistory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/apiResponse";
import { ApiError } from "@/utils/apiError";
import { buyerCreateSchema } from "@/validations/buyer";
import { randomUUID } from "crypto";

export const GET = asyncHandler(async (req: NextRequest, { params }) => {
  const { id } = await params;

  // Fetch buyer
  const [buyer] = await db
    .select()
    .from(buyers)
    .where(eq(buyers.id, id))
    .limit(1);

  if (!buyer) {
    throw new ApiError(404, "Buyer not found");
  }

  return NextResponse.json(
    new ApiResponse(true, "Buyer fetched successfully", buyer)
  );
});

// Update

export const PUT = asyncHandler(async (req: NextRequest, { params }) => {
  const { id } = await params;
  const body = await req.json();

  // Validate input
  const parsed = buyerCreateSchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0].message);
  }
  const data = parsed.data;

  // TODO :  Simulate auth (replace with real auth later)
  const currentUserId = randomUUID();

  // Fetch existing buyer
  const [existing] = await db.select().from(buyers).where(eq(buyers.id, id));
  if (!existing) throw new ApiError(404, "Buyer not found");

  // Ownership check
  if (existing.ownerId !== currentUserId) {
    throw new ApiError(403, "You can only update your own leads");
  }

  //  Concurrency check
  if (body.updatedAt && body.updatedAt !== existing.updatedAt.toISOString()) {
    throw new ApiError(
      409,
      "Record changed since you last viewed. Please refresh."
    );
  }

  //  Diff for history
  const diff: Record<string, any> = {};
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
      changedBy: currentUserId,
      changedAt: new Date(),
      diff,
    });
  }

  return NextResponse.json(
    new ApiResponse(true, "Buyer updated successfully", updated)
  );
});

export const DELETE = asyncHandler(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = await params;

    // TODO: Replace with NextAuth user session
    const currentUserId = "65424d45-1cb4-4b07-8f80-b0e1fdcd6701";

    // Check if buyer exists
    const [existing] = await db.select().from(buyers).where(eq(buyers.id, id));

    if (!existing) {
      throw new ApiError(404, "Buyer not found");
    }

    // Ownership check
    if (existing.ownerId !== currentUserId) {
      throw new ApiError(403, "Not authorized to delete this buyer");
    }

    // Delete buyer
    await db.delete(buyers).where(eq(buyers.id, id));

    // Insert into history (audit trail)
    await db.insert(buyerHistory).values({
      id: randomUUID(),
      buyerId: existing.id,
      changedBy: currentUserId,
      changedAt: new Date(),
      diff: { deleted: true, ...existing }, // store old values + mark deleted
    });

    return NextResponse.json(
      new ApiResponse(true, "Buyer deleted successfully")
    );
  }
);
