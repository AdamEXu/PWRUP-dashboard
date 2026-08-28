"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@pwrup/shared-ui/dialog";

interface PingDataPoint {
  time: string;
  ping: number;
  timestamp: number;
}

interface PingChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  hostUrl: string;
  pingHistory: PingDataPoint[];
}

export function PingChartModal({
  isOpen,
  onClose,
  hostUrl,
  pingHistory,
}: PingChartModalProps) {
  const chartData = pingHistory.map((point) => ({
    time: point.time,
    ping: point.ping,
  }));

  const latestPing =
    pingHistory.length > 0 ? pingHistory[pingHistory.length - 1]?.ping : null;
  const avgPing =
    pingHistory.length > 0
      ? Math.round(
          pingHistory.reduce((sum, p) => sum + p.ping, 0) / pingHistory.length
        )
      : null;
  const minPing =
    pingHistory.length > 0
      ? Math.min(...pingHistory.map((p) => p.ping))
      : null;
  const maxPing =
    pingHistory.length > 0
      ? Math.max(...pingHistory.map((p) => p.ping))
      : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Ping Statistics</DialogTitle>
          <DialogDescription className="font-mono">{hostUrl}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-muted/50 rounded-lg p-3 border">
            <div className="text-xs text-muted-foreground">Current</div>
            <div className="text-lg font-semibold">
              {latestPing !== null ? `${latestPing}ms` : "—"}
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 border">
            <div className="text-xs text-muted-foreground">Average</div>
            <div className="text-lg font-semibold">
              {avgPing !== null ? `${avgPing}ms` : "—"}
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 border">
            <div className="text-xs text-muted-foreground">Min</div>
            <div className="text-lg font-semibold text-emerald-500">
              {minPing !== null ? `${minPing}ms` : "—"}
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 border">
            <div className="text-xs text-muted-foreground">Max</div>
            <div className="text-lg font-semibold text-destructive">
              {maxPing !== null ? `${maxPing}ms` : "—"}
            </div>
          </div>
        </div>

        <div className="h-64">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="pingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  axisLine={{ stroke: "#4b5563" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  axisLine={{ stroke: "#4b5563" }}
                  label={{
                    value: "ms",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#9ca3af",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "6px",
                    color: "#f3f4f6",
                  }}
                  formatter={(value) => [
                    `${typeof value === "number" ? value : 0}ms`,
                    "Ping",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="ping"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#pingGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No data yet. Waiting for ping measurements...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
