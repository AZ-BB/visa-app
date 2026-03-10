import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://ip-api.com/json/?fields=countryCode,status");
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: "fail" }, { status: 500 });
  }
}
