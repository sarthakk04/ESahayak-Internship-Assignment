import { NextRequest, NextResponse } from "next/server";

type Handler = (req: NextRequest, context?: any) => Promise<NextResponse>;

export const asyncHandler =
  (handler: Handler) =>
  async (req: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      return await handler(req, context);
    } catch (err: any) {
      console.error("❌ API Error:", err);
      return NextResponse.json(
        { success: false, message: err.message || "Internal Server Error" },
        { status: err.statusCode || 500 }
      );
    }
  };
