import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiResponse } from "@/utils/apiResponse";
import { ApiError } from "@/utils/apiError";
import { parse } from "csv-parse/sync";
import { buyerSchema } from "@/validations/buyer";
import { db } from "@/db";
import { buyers } from "@/db/schema";
import { auth } from "@clerk/nextjs/server"; // 🔹 NEW

export const runtime = "nodejs";

export const POST = asyncHandler(async (req: NextRequest) => {
  const { userId } = await auth();
  if (!userId) throw new ApiError(401, "Unauthorized");

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) throw new ApiError(400, "CSV file is required");

  // Read file content
  const buffer = Buffer.from(await file.arrayBuffer());
  const csvContent = buffer.toString("utf8");

  // Parse CSV
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, unknown>[];

  if (records.length > 200) {
    throw new ApiError(400, "CSV cannot contain more than 200 rows");
  }

  const errors: { row: number; errors: unknown }[] = [];
  const validRows: typeof buyers.$inferInsert[] = [];

  records.forEach((row: Record<string, unknown>, index: number) => {
    // Convert tags string → array
    const tags = row.tags
      ? String(row.tags)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined;

    const parsed = buyerSchema.safeParse({
      ...row,
      tags,
      budgetMin: row.budgetMin ? Number(row.budgetMin) : undefined,
      budgetMax: row.budgetMax ? Number(row.budgetMax) : undefined,
    });

    if (!parsed.success) {
      errors.push({ row: index + 1, errors: parsed.error.format() });
    } else {
      validRows.push({
        ...parsed.data,
        ownerId: userId, // ✅ enforce ownership
      });
    }
  });

  if (validRows.length > 0) {
    await db.insert(buyers).values(validRows);
  }

  return NextResponse.json(
    new ApiResponse(true, "Import completed", {
      inserted: validRows.length,
      errors,
    })
  );
});
