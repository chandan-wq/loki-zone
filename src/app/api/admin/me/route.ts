import { NextRequest, NextResponse } from "next/server";
import { getVerifiedAdmin } from "@/lib/adminAuthServer";

export async function GET(req: NextRequest) {
  try {
    const adminSession = await getVerifiedAdmin(req);
    return NextResponse.json({
      success: true,
      authorized: adminSession.authorized,
      email: adminSession.email,
      role: adminSession.role,
      userId: adminSession.userId,
    });
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) {
      throw err;
    }
    console.error("[Admin ME Check Error]:", err);
    return NextResponse.json(
      { success: false, authorized: false, role: null, email: null },
      { status: 500 }
    );
  }
}
