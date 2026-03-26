// app/api/auth-admin/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { pass } = await request.json();

  if (pass === process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false }, { status: 401 });
}
