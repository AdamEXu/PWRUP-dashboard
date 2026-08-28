// packages/shared-ui/src/Charts.tsx - Purpose: reusable, minimal visualizations for CPU, processes, and network
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";

// CPU Cores Bar Chart
interface CpuCoresChartProps {
  cores: number[];
  className?: string;
}

export function CpuCoresChart({ cores, className = "" }: CpuCoresChartProps) {
  const data = cores.map((usage, index) => ({
    core: `Core ${index + 1}`,
    usage: Number(usage.toFixed(1)),
    fill: usage > 80 ? "#ef4444" : usage > 60 ? "#f59e0b" : "#3b82f6",
  }));

  return (
    <div className={`h-48 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="core"
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={{ stroke: "#4b5563" }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={{ stroke: "#4b5563" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "6px",
              color: "#f3f4f6",
            }}
            formatter={(value) => [`${value}%`, "CPU Usage"]}
          />
          <Bar dataKey="usage" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// System Usage Pie Chart
interface SystemUsagePieProps {
  cpu: number;
  memory: number;
  disk: number;
  className?: string;
}

export function SystemUsagePie({
  cpu,
  memory,
  disk,
  className = "",
}: SystemUsagePieProps) {
  // Render three minimal donuts instead of one misleading combined pie
  const items = [
    { label: "CPU", value: cpu, color: "#3b82f6" },
    { label: "Memory", value: memory, color: "#10b981" },
    { label: "Disk", value: disk, color: "#f59e0b" },
  ].map((x) => ({ ...x, value: Number(x.value.toFixed(1)) }));

  return (
    <div className={`grid grid-cols-3 gap-4 ${className}`}>
      {items.map((it) => {
        const data = [
          { name: it.label, value: it.value, fill: it.color },
          { name: "Free", value: Math.max(0, 100 - it.value), fill: "#374151" },
        ];
        return (
          <div key={it.label} className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={58}
                  paddingAngle={1}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`${it.label}-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "6px",
                    color: "#f3f4f6",
                  }}
                  formatter={(value) => [`${value}%`, it.label]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
}

// Process CPU Usage Bar Chart
interface ProcessChartProps {
  processes: Array<{ name: string; cpuUsage: number; pid: number }>;
  className?: string;
}

export function ProcessChart({ processes, className = "" }: ProcessChartProps) {
  const data = processes.slice(0, 6).map((process, index) => ({
    name:
      process.name.length > 12
        ? process.name.substring(0, 12) + "..."
        : process.name,
    usage: Number(process.cpuUsage.toFixed(1)),
    pid: process.pid,
    fill: index < 2 ? "#ef4444" : index < 4 ? "#f59e0b" : "#3b82f6",
  }));

  return (
    <div className={`h-48 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 5, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            type="number"
            domain={[0, "dataMax"]}
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={{ stroke: "#4b5563" }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={{ stroke: "#4b5563" }}
            width={35}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "6px",
              color: "#f3f4f6",
            }}
            formatter={(value, _name, item) => [
              `${value}% CPU`,
              `${item.payload?.name ?? _name} (PID: ${item.payload?.pid ?? "?"})`,
            ]}
          />
          <Bar dataKey="usage" radius={[0, 2, 2, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Network Activity Area Chart (for historical data - placeholder for now)
interface NetworkChartProps {
  networkIn: number;
  networkOut: number;
  className?: string;
}

export function NetworkChart({
  networkIn,
  networkOut,
  className = "",
}: NetworkChartProps) {
  // Mock historical data - in real implementation you'd track this over time
  const data = Array.from({ length: 10 }, (_, i) => ({
    time: `${i + 1}`,
    in: Number((networkIn * (0.8 + Math.random() * 0.4)).toFixed(0)),
    out: Number((networkOut * (0.8 + Math.random() * 0.4)).toFixed(0)),
  }));

  return (
    <div className={`h-32 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={{ stroke: "#4b5563" }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={{ stroke: "#4b5563" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "6px",
              color: "#f3f4f6",
            }}
            formatter={(value, name) => [
              `${value} B/s`,
              name === "in" ? "Download" : "Upload",
            ]}
          />
          <Area
            type="monotone"
            dataKey="in"
            stackId="1"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="out"
            stackId="1"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
