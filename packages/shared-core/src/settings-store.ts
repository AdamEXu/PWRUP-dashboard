import os from "os";
import path from "path";
import { promises as fs } from "fs";
import type {
  ConnectionSettings,
  HudVisibilitySettings,
  MapSettings,
  SharedSettingsPayload,
  VisualSettings,
} from "./settings-schema";
import { DEFAULTS, DEFAULT_HUD_VISIBILITY, DEFAULT_MAP_SETTINGS, DEFAULT_VISUAL_SETTINGS, normalizeReconnectTimeoutSeconds } from "./settings-schema";

function getSharedSettingsPath(): string {
  const fromEnv = process.env.PWRUP_SHARED_SETTINGS_PATH?.trim();
  if (fromEnv) {
    return path.resolve(fromEnv);
  }

  return path.join(os.homedir(), ".pwrup", "shared-settings", "connection-settings.json");
}

async function ensureDirectory(filePath: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

function normalizeSettings(next: Partial<ConnectionSettings>): ConnectionSettings {
  const host = typeof next.host === "string" && next.host.trim().length > 0 ? next.host.trim() : DEFAULTS.host;
  const port =
    typeof next.port === "number" && Number.isFinite(next.port) && next.port > 0 && next.port <= 65535
      ? Math.round(next.port)
      : DEFAULTS.port;

  const nt = next.networkTables ?? DEFAULTS.networkTables;

  const ntHost =
    typeof nt.host === "string" && nt.host.trim().length > 0 ? nt.host.trim() : DEFAULTS.networkTables.host;
  const ntPort =
    typeof nt.port === "number" && Number.isFinite(nt.port) && nt.port > 0 && nt.port <= 65535
      ? Math.round(nt.port)
      : DEFAULTS.networkTables.port;
  const sharedTable =
    typeof nt.sharedTable === "string" && nt.sharedTable.trim().length > 0
      ? nt.sharedTable.trim().replace(/^\/+|\/+$/g, "")
      : DEFAULTS.networkTables.sharedTable;
  const selectedPathTopic =
    typeof nt.selectedPathTopic === "string" && nt.selectedPathTopic.trim().length > 0
      ? nt.selectedPathTopic.trim().replace(/^\/+|\/+$/g, "")
      : DEFAULTS.networkTables.selectedPathTopic;

  return {
    host,
    port,
    reconnectTimeoutSeconds: normalizeReconnectTimeoutSeconds(next.reconnectTimeoutSeconds),
    networkTables: {
      host: ntHost,
      port: ntPort,
      sharedTable,
      selectedPathTopic,
    },
  };
}

function normalizeHudVisibility(next: Partial<HudVisibilitySettings> | undefined): HudVisibilitySettings {
  return {
    showMap:
      typeof next?.showMap === "boolean" ? next.showMap : DEFAULT_HUD_VISIBILITY.showMap,
    showTimers:
      typeof next?.showTimers === "boolean"
        ? next.showTimers
        : DEFAULT_HUD_VISIBILITY.showTimers,
    showStatus:
      typeof next?.showStatus === "boolean"
        ? next.showStatus
        : DEFAULT_HUD_VISIBILITY.showStatus,
    showCamera:
      typeof next?.showCamera === "boolean"
        ? next.showCamera
        : DEFAULT_HUD_VISIBILITY.showCamera,
  };
}

function normalizeVisualSettings(_next: Partial<VisualSettings> | undefined): VisualSettings {
  return DEFAULT_VISUAL_SETTINGS;
}

function normalizeMapSettings(next: Partial<MapSettings> | undefined): MapSettings {
  return {
    mode: next?.mode === 'follow' || next?.mode === 'driver' ? next.mode : DEFAULT_MAP_SETTINGS.mode,
    angle:
      typeof next?.angle === "number" && Number.isFinite(next.angle)
        ? Math.max(0, Math.min(1, next.angle))
        : DEFAULT_MAP_SETTINGS.angle,
    zoom:
      typeof next?.zoom === "number" && Number.isFinite(next.zoom)
        ? Math.max(0, Math.min(1, next.zoom))
        : DEFAULT_MAP_SETTINGS.zoom,
  };
}

function normalizePayload(raw: unknown): SharedSettingsPayload {
  const parsed = raw as Partial<SharedSettingsPayload> | undefined;
  const normalizedSettings = normalizeSettings(parsed?.settings ?? DEFAULTS);
  const normalizedHudVisibility = normalizeHudVisibility(parsed?.hudVisibility);
  const normalizedMapSettings = normalizeMapSettings(parsed?.mapSettings);
  const normalizedVisualSettings = normalizeVisualSettings(parsed?.visualSettings);

  const version =
    typeof parsed?.version === "number" && Number.isFinite(parsed.version) && parsed.version >= 1
      ? Math.floor(parsed.version)
      : 1;

  const updatedAtIso =
    typeof parsed?.updatedAtIso === "string" && parsed.updatedAtIso.trim().length > 0
      ? parsed.updatedAtIso
      : new Date().toISOString();

  return {
    version,
    updatedAtIso,
    settings: normalizedSettings,
    hudVisibility: normalizedHudVisibility,
    mapSettings: normalizedMapSettings,
    visualSettings: normalizedVisualSettings,
  };
}

async function writeAtomically(filePath: string, payload: SharedSettingsPayload): Promise<void> {
  await ensureDirectory(filePath);
  const tempPath = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  await fs.writeFile(tempPath, JSON.stringify(payload, null, 2), "utf8");
  await fs.rename(tempPath, filePath);
}

export async function readSharedSettings(): Promise<SharedSettingsPayload> {
  const filePath = getSharedSettingsPath();

  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    const normalized = normalizePayload(parsed);

    if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
      await writeAtomically(filePath, normalized);
    }

    return normalized;
  } catch {
    const initial: SharedSettingsPayload = {
      version: 1,
      updatedAtIso: new Date().toISOString(),
      settings: DEFAULTS,
      hudVisibility: DEFAULT_HUD_VISIBILITY,
    };
    await writeAtomically(filePath, initial);
    return initial;
  }
}

export async function updateSharedSettings(next: {
  settings?: ConnectionSettings;
  hudVisibility?: HudVisibilitySettings;
  mapSettings?: MapSettings;
  visualSettings?: VisualSettings;
}): Promise<SharedSettingsPayload> {
  const current = await readSharedSettings();
  const updated: SharedSettingsPayload = {
    version: current.version + 1,
    updatedAtIso: new Date().toISOString(),
    settings: normalizeSettings(next.settings ?? current.settings),
    hudVisibility: normalizeHudVisibility(next.hudVisibility ?? current.hudVisibility),
    mapSettings: normalizeMapSettings(next.mapSettings ?? current.mapSettings),
    visualSettings: normalizeVisualSettings(next.visualSettings ?? current.visualSettings),
  };

  await writeAtomically(getSharedSettingsPath(), updated);
  return updated;
}

export function getSharedSettingsFilePath(): string {
  return getSharedSettingsPath();
}
