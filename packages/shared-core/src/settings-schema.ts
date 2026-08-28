// packages/shared-core/src/settings-schema.ts
export interface NetworkTablesSettings {
  host: string;
  port: number;
  sharedTable: string;
  selectedPathTopic: string;
}

export interface ConnectionSettings {
  host: string;
  port: number;
  reconnectTimeoutSeconds: number;
  networkTables: NetworkTablesSettings;
}

export interface HudVisibilitySettings {
  showMap: boolean;
  showTimers: boolean;
  showStatus: boolean;
  showCamera: boolean;
}

export interface MapSettings {
  mode: 'follow' | 'driver';
  angle: number; // 0–1, 0 = top-down, 1 = level with robot
  zoom: number;  // 0–1, 0 = far, 1 = close
  // Idle behavior is always enabled (no longer configurable)
}

export interface VisualSettings {
  logarithmicDepthBuffer: boolean;
  backdropBlur: boolean;
  renderScale: number; // 0.25 | 0.5 | 0.75 | 1.0
}

export interface SharedSettingsPayload {
  version: number;
  updatedAtIso: string;
  settings: ConnectionSettings;
  hudVisibility: HudVisibilitySettings;
  mapSettings?: MapSettings;
  visualSettings?: VisualSettings;
}

export const DEFAULTS: ConnectionSettings = {
  host: "10.47.65.7",
  port: 8080,
  reconnectTimeoutSeconds: 10,
  networkTables: {
    host: "10.47.65.2",
    port: 5810,
    sharedTable: "Shared",
    selectedPathTopic: "PathPlanner/SelectedPath",
  },
};

export function normalizeReconnectTimeoutSeconds(value: unknown): number {
  if (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 2 &&
    value <= 60
  ) {
    return Math.round(value);
  }
  return DEFAULTS.reconnectTimeoutSeconds;
}

export const DEFAULT_HUD_VISIBILITY: HudVisibilitySettings = {
  showMap: true,
  showTimers: true,
  showStatus: true,
  showCamera: true,
};

export const DEFAULT_MAP_SETTINGS: MapSettings = {
  mode: 'follow',
  angle: 0.3,
  zoom: 0.5,
};

const VALID_RENDER_SCALES = [0.25, 0.5, 0.75, 1.0] as const;

export const DEFAULT_VISUAL_SETTINGS: VisualSettings = {
  logarithmicDepthBuffer: false,
  backdropBlur: true,
  renderScale: 1.0,
};

export function normalizeRenderScale(v: unknown): number {
  return VALID_RENDER_SCALES.includes(v as typeof VALID_RENDER_SCALES[number])
    ? (v as number)
    : DEFAULT_VISUAL_SETTINGS.renderScale;
}

export function frcTeamToRobotIp(teamNumber: number, lastOctet = 2): string {
  const team = Math.max(0, Math.floor(teamNumber));
  const octet = Math.min(254, Math.max(1, Math.floor(lastOctet)));
  const upper = Math.floor(team / 100);
  const lower = team % 100;
  return `10.${upper}.${lower}.${octet}`;
}

export function ntPathFromTableAndEntry(table: string, entry: string): string {
  const normalizedTable = table.trim().replace(/^\/+|\/+$/g, "");
  const normalizedEntry = entry.trim().replace(/^\/+|\/+$/g, "");
  return `/${normalizedTable}/${normalizedEntry}`;
}

export function ntSelectedPathTopics(
  table: string,
  selectedPathTopic: string,
): {
  requestTopic: string;
  stateTopic: string;
  requestTopicWithoutLeadingSlash: string;
  stateTopicWithoutLeadingSlash: string;
} {
  const basePath = ntPathFromTableAndEntry(table, selectedPathTopic);
  const basePathWithoutLeadingSlash = basePath.replace(/^\/+/, "");

  return {
    requestTopic: `${basePath}/Request`,
    stateTopic: `${basePath}/State`,
    requestTopicWithoutLeadingSlash: `${basePathWithoutLeadingSlash}/Request`,
    stateTopicWithoutLeadingSlash: `${basePathWithoutLeadingSlash}/State`,
  };
}
