import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Proxy to backend /me endpoint
  const backendUrl = "http://localhost:2010"; // <-- Hardcoded backend URL

  // Only forward the access_token cookie (not all cookies)
  const allCookies = req.headers.get("cookie") || "";
  let accessTokenCookie = "";
  if (allCookies) {
    const cookies = allCookies.split(";").map(c => c.trim());
    const access = cookies.find(c => c.startsWith("access_token="));
    if (access) accessTokenCookie = access;
  }
  const authorization = req.headers.get("authorization") || "";
  const headers: Record<string, string> = {};
  if (accessTokenCookie) headers["cookie"] = accessTokenCookie;
  if (authorization) headers["authorization"] = authorization;

  const backendRes = await fetch(`${backendUrl}/api/auth/me`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
}
