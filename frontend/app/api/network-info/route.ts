import { NextResponse } from "next/server";
import os from "os";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const ifaces = os.networkInterfaces();
  let detectedIp = "127.0.0.1";

  // Prioritize active non-internal IPv4 addresses
  for (const name of Object.keys(ifaces)) {
    const list = ifaces[name];
    if (!list) continue;
    for (const iface of list) {
      if (iface.family === "IPv4" && !iface.internal) {
        // Prefer Wi-Fi or Ethernet
        detectedIp = iface.address;
        break;
      }
    }
  }

  return NextResponse.json({
    ip: detectedIp,
    url: `http://${detectedIp}:3000`,
  });
}

