import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: "/api/:path*", // Apply only to API routes
};

export default function middleware(request: NextRequest) {

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Continue with the request and add CORS headers to the response
  const response = NextResponse.next();

  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Credentials", "true");

  return response;
}
