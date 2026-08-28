// packages/shared-ui/src/connection-settings-form.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { Input } from "./input";
import { Label } from "./label";
import { cn } from "./lib/utils";

interface NetworkTablesSettingsLike {
  host: string;
  port: number;
  sharedTable: string;
  selectedPathTopic: string;
}

interface ConnectionSettingsLike {
  host: string;
  port: number;
  networkTables: NetworkTablesSettingsLike;
}

interface ConnectionSettingsFormProps<T extends ConnectionSettingsLike> {
  settings: T;
  setSettings: (next: T) => void;
  resetDefaults: () => void;
  mode?: "default" | "touchscreen";
  className?: string;
}

function ntPathFromTableAndEntry(table: string, entry: string): string {
  const normalizedTable = table.trim().replace(/^\/+|\/+$/g, "");
  const normalizedEntry = entry.trim().replace(/^\/+|\/+$/g, "");
  return `/${normalizedTable}/${normalizedEntry}`;
}

function ntSelectedPathTopics(table: string, selectedPathTopic: string) {
  const basePath = ntPathFromTableAndEntry(table, selectedPathTopic);
  const basePathWithoutLeadingSlash = basePath.replace(/^\/+/, "");

  return {
    requestTopic: `${basePath}/Request`,
    stateTopic: `${basePath}/State`,
    requestTopicWithoutLeadingSlash: `${basePathWithoutLeadingSlash}/Request`,
    stateTopicWithoutLeadingSlash: `${basePathWithoutLeadingSlash}/State`,
  };
}

export function ConnectionSettingsForm<T extends ConnectionSettingsLike>({
  settings,
  setSettings,
  resetDefaults,
  mode = "default",
  className,
}: ConnectionSettingsFormProps<T>) {
  const [host, setHost] = useState(settings.host);
  const [port, setPort] = useState<number>(settings.port);
  const [ntHost, setNtHost] = useState<string>(settings.networkTables.host);
  const [ntPort, setNtPort] = useState<number>(settings.networkTables.port);
  const [sharedTable, setSharedTable] = useState<string>(settings.networkTables.sharedTable);
  const [selectedPathTopic, setSelectedPathTopic] = useState<string>(
    settings.networkTables.selectedPathTopic,
  );
  const [saved, setSaved] = useState(false);
  const savedTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setHost(settings.host);
    setPort(settings.port);
    setNtHost(settings.networkTables.host);
    setNtPort(settings.networkTables.port);
    setSharedTable(settings.networkTables.sharedTable);
    setSelectedPathTopic(settings.networkTables.selectedPathTopic);
  }, [
    settings.host,
    settings.networkTables.host,
    settings.networkTables.port,
    settings.networkTables.selectedPathTopic,
    settings.networkTables.sharedTable,
    settings.port,
  ]);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current !== null) {
        window.clearTimeout(savedTimerRef.current);
      }
    };
  }, []);

  const nextHost = host.trim();
  const nextPort = Number(port);
  const nextNtHost = ntHost.trim();
  const nextNtPort = Number(ntPort);
  const nextSharedTable = sharedTable.trim();
  const nextSelectedPathTopic = selectedPathTopic.trim();
  const canSave =
    nextHost.length > 0 &&
    Number.isFinite(nextPort) &&
    nextPort > 0 &&
    nextPort <= 65535 &&
    nextNtHost.length > 0 &&
    Number.isFinite(nextNtPort) &&
    nextNtPort > 0 &&
    nextNtPort <= 65535 &&
    nextSharedTable.length > 0 &&
    nextSelectedPathTopic.length > 0;
  const hasChanges =
    nextHost !== settings.host ||
    Math.round(nextPort) !== settings.port ||
    nextNtHost !== settings.networkTables.host ||
    Math.round(nextNtPort) !== settings.networkTables.port ||
    nextSharedTable !== settings.networkTables.sharedTable ||
    nextSelectedPathTopic !== settings.networkTables.selectedPathTopic;
  const previewTopics = ntSelectedPathTopics(nextSharedTable, nextSelectedPathTopic);
  const isTouchscreen = mode === "touchscreen";

  function flashSaved() {
    setSaved(true);
    if (savedTimerRef.current !== null) {
      window.clearTimeout(savedTimerRef.current);
    }
    savedTimerRef.current = window.setTimeout(() => setSaved(false), 1500);
  }

  function onSave() {
    if (!canSave) {
      setSaved(false);
      return;
    }

    setSettings({
      ...settings,
      host: nextHost,
      port: Math.round(nextPort),
      networkTables: {
        host: nextNtHost,
        port: Math.round(nextNtPort),
        sharedTable: nextSharedTable,
        selectedPathTopic: nextSelectedPathTopic,
      },
    });
    flashSaved();
  }

  function onReset() {
    resetDefaults();
    setSaved(false);
  }

  return (
    <div
      className={cn(
        "space-y-6",
        isTouchscreen ? "mx-auto w-full max-w-6xl px-8 py-8" : "max-w-2xl",
        className,
      )}
    >
      <div
        className={cn(
          "sticky z-10 flex flex-wrap items-center justify-between rounded-md border border-white/10 bg-zinc-950/95 backdrop-blur",
          isTouchscreen ? "top-0 gap-4 px-5 py-4" : "top-3 gap-3 px-3 py-2",
        )}
      >
        <span className={cn("text-zinc-400", isTouchscreen ? "text-base" : "text-sm")}>
          {hasChanges ? "Unsaved changes" : "All changes saved"}
        </span>
        <div className="flex items-center gap-3">
          <Button
            onClick={onSave}
            disabled={!canSave || !hasChanges}
            size={isTouchscreen ? "lg" : "default"}
          >
            Save changes
          </Button>
          <Button
            variant="outline"
            onClick={onReset}
            size={isTouchscreen ? "lg" : "default"}
          >
            Reset defaults
          </Button>
          {saved && (
            <span className={cn("text-emerald-400", isTouchscreen ? "text-base" : "text-sm")}>
              Saved
            </span>
          )}
        </div>
      </div>

      <div className={cn("grid gap-6", isTouchscreen && "lg:grid-cols-2")}>
        <Card className="border-white/10 bg-[#232323] text-white shadow-none">
          <CardHeader className={cn(isTouchscreen && "space-y-3 p-6")}>
            <CardTitle className={cn(isTouchscreen && "text-2xl")}>Autobahn Connection</CardTitle>
            <CardDescription className="text-zinc-400">
              Configure the host and port for the Autobahn WebSocket connection.
            </CardDescription>
          </CardHeader>
          <CardContent className={cn("space-y-4", isTouchscreen && "p-6 pt-0")}>
            <div className="space-y-2">
              <Label htmlFor={`host-${mode}`} className={cn(isTouchscreen && "text-base")}>
                Host
              </Label>
              <Input
                id={`host-${mode}`}
                type="text"
                placeholder="e.g. 10.47.65.7"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                className={cn(
                  "border-white/10 bg-zinc-950 text-white placeholder:text-zinc-500",
                  isTouchscreen && "h-14 text-lg",
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`port-${mode}`} className={cn(isTouchscreen && "text-base")}>
                Port
              </Label>
              <Input
                id={`port-${mode}`}
                type="text"
                inputMode="numeric"
                placeholder="8080"
                value={String(port)}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D+/g, "");
                  setPort(value === "" ? 0 : Number(value));
                }}
                className={cn(
                  "border-white/10 bg-zinc-950 text-white placeholder:text-zinc-500",
                  isTouchscreen && "h-14 text-lg",
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#232323] text-white shadow-none">
          <CardHeader className={cn(isTouchscreen && "space-y-3 p-6")}>
            <CardTitle className={cn(isTouchscreen && "text-2xl")}>NetworkTables (Paths)</CardTitle>
            <CardDescription className="text-zinc-400">
              Path sync uses WPILib NT4 and connects to your configured robot host/IP. No
              &quot;/Shared&quot; prefix is added automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className={cn("space-y-4", isTouchscreen && "p-6 pt-0")}>
            <div className="space-y-2">
              <Label htmlFor={`nt-host-${mode}`} className={cn(isTouchscreen && "text-base")}>
                Robot NT Host / IP
              </Label>
              <Input
                id={`nt-host-${mode}`}
                type="text"
                placeholder="10.47.65.2 or roborio-4765-frc.local"
                value={ntHost}
                onChange={(e) => setNtHost(e.target.value)}
                className={cn(
                  "border-white/10 bg-zinc-950 text-white placeholder:text-zinc-500",
                  isTouchscreen && "h-14 text-lg",
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`nt-port-${mode}`} className={cn(isTouchscreen && "text-base")}>
                NT Port
              </Label>
              <Input
                id={`nt-port-${mode}`}
                type="text"
                inputMode="numeric"
                placeholder="5810"
                value={String(ntPort)}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D+/g, "");
                  setNtPort(value === "" ? 0 : Number(value));
                }}
                className={cn(
                  "border-white/10 bg-zinc-950 text-white placeholder:text-zinc-500",
                  isTouchscreen && "h-14 text-lg",
                )}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor={`nt-shared-table-${mode}`}
                className={cn(isTouchscreen && "text-base")}
              >
                Dashboard-Robot Shared Table
              </Label>
              <Input
                id={`nt-shared-table-${mode}`}
                type="text"
                placeholder="Shared/PathPlanner"
                value={sharedTable}
                onChange={(e) => setSharedTable(e.target.value)}
                className={cn(
                  "border-white/10 bg-zinc-950 text-white placeholder:text-zinc-500",
                  isTouchscreen && "h-14 text-lg",
                )}
              />
              <p className="text-xs text-zinc-500">Examples: Shared/PathPlanner or PathPlanner.</p>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor={`nt-selected-topic-${mode}`}
                className={cn(isTouchscreen && "text-base")}
              >
                Request Topic Base
              </Label>
              <Input
                id={`nt-selected-topic-${mode}`}
                type="text"
                placeholder="SelectedPath"
                value={selectedPathTopic}
                onChange={(e) => setSelectedPathTopic(e.target.value)}
                className={cn(
                  "border-white/10 bg-zinc-950 text-white placeholder:text-zinc-500",
                  isTouchscreen && "h-14 text-lg",
                )}
              />
              <p className="text-xs text-zinc-500">
                This is the request/state base. Do not include /Request or /State.
              </p>
            </div>
            <div
              className={cn(
                "rounded-md border border-white/10 bg-zinc-950 text-zinc-300",
                isTouchscreen ? "px-4 py-4 text-sm" : "px-3 py-2 text-xs",
              )}
            >
              NetworkTables target host:{" "}
              <span className="font-mono text-zinc-100">{ntHost || "(not set)"}</span>
              <br />
              Request topic (app to robot):{" "}
              <span className="font-mono text-zinc-100">{previewTopics.requestTopic}</span>
              <br />
              State topic (robot to app):{" "}
              <span className="font-mono text-zinc-100">{previewTopics.stateTopic}</span>
              <br />
              Robot-side constants style (no leading slash):{" "}
              <span className="font-mono text-zinc-100">
                {previewTopics.requestTopicWithoutLeadingSlash} /{" "}
                {previewTopics.stateTopicWithoutLeadingSlash}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
