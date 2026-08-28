// apps/admin/src/app/api/discovery/watchdog/route.ts - Purpose: mDNS-discover the first watchdog and settle on up, timeout, or error
import { NextRequest, NextResponse } from "next/server";
import Bonjour, { Service } from "bonjour-service";

export const runtime = "nodejs";

const DEFAULT_TIMEOUT_MS = 2500;
const MAX_TIMEOUT_MS = 15000;
const FALLBACK_AUTOBAHN_PORT = 8080;

interface DiscoveryResponse {
  ok: boolean;
  found: boolean;
  host?: string;
  port?: number;
  systemName?: string;
  hostname?: string;
  hostnameLocal?: string;
}

function parseTimeoutMs(value: string | null): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_TIMEOUT_MS;
  }
  const rounded = Math.round(parsed);
  if (rounded < 300) return 300;
  if (rounded > MAX_TIMEOUT_MS) return MAX_TIMEOUT_MS;
  return rounded;
}

function readTxtValue(txt: Service["txt"], key: string): string | undefined {
  if (!txt || typeof txt !== "object") {
    return undefined;
  }

  const value = (txt as Record<string, unknown>)[key];
  if (typeof value === "string") {
    return value;
  }
  if (Buffer.isBuffer(value)) {
    return value.toString("utf8");
  }
  if (Array.isArray(value)) {
    const firstString = value.find((entry) => typeof entry === "string");
    if (typeof firstString === "string") {
      return firstString;
    }
  }
  return undefined;
}

function parsePort(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  if (parsed <= 0 || parsed > 65535) return undefined;
  return Math.round(parsed);
}

function pickHost(service: Service): string | undefined {
  const addresses = (service.addresses ?? []).filter((entry) => typeof entry === "string");

  const preferred = addresses.find(
    (address) =>
      /^\d+\.\d+\.\d+\.\d+$/.test(address) &&
      !address.startsWith("127.") &&
      !address.startsWith("169.254."),
  );
  if (preferred) {
    return preferred;
  }

  const fallbackIPv4 = addresses.find((address) => /^\d+\.\d+\.\d+\.\d+$/.test(address));
  if (fallbackIPv4) {
    return fallbackIPv4;
  }

  if (service.referer?.address) {
    return service.referer.address;
  }

  if (service.host) {
    return service.host.replace(/\.$/, "");
  }

  return undefined;
}

function toResponse(service: Service): DiscoveryResponse | null {
  const host = pickHost(service);
  if (!host) {
    return null;
  }

  const autobahnPort = parsePort(readTxtValue(service.txt, "autobahn_port")) ?? FALLBACK_AUTOBAHN_PORT;

  return {
    ok: true,
    found: true,
    host,
    port: autobahnPort,
    systemName: readTxtValue(service.txt, "system_name"),
    hostname: readTxtValue(service.txt, "hostname"),
    hostnameLocal: readTxtValue(service.txt, "hostname_local"),
  };
}

function discoverFirstWatchdog(timeoutMs: number): Promise<DiscoveryResponse> {
  return new Promise((resolve) => {
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let bonjour: Bonjour | null = null;
    let browser: ReturnType<Bonjour["find"]> | null = null;

    const finish = (payload: DiscoveryResponse) => {
      if (settled) return;
      settled = true;
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }

      try {
        browser?.stop();
      } catch {
        // Ignore stop failures.
      }

      if (bonjour) {
        bonjour.destroy(() => {
          resolve(payload);
        });
      } else {
        resolve(payload);
      }
    };

    // Default Bonjour errorCallback rethrows; settle the request instead.
    bonjour = new Bonjour(undefined, () => {
      finish({ ok: false, found: false });
    });
    browser = bonjour.find({ type: "watchdog", protocol: "udp" });

    browser.on("up", (service: Service) => {
      const mapped = toResponse(service);
      if (mapped) {
        finish(mapped);
      }
    });

    // BrowserEvents omits "error"; listen via EventEmitter so mDNS failures
    // cannot become unhandled EventEmitter exceptions.
    (browser as NodeJS.EventEmitter).on("error", () => {
      finish({ ok: false, found: false });
    });

    timer = setTimeout(() => {
      finish({ ok: true, found: false });
    }, timeoutMs);
  });
}

export async function GET(request: NextRequest) {
  const timeoutMs = parseTimeoutMs(request.nextUrl.searchParams.get("timeoutMs"));

  try {
    const discovery = await discoverFirstWatchdog(timeoutMs);
    return NextResponse.json(discovery, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        found: false,
        message: (error as Error).message,
      },
      { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}
