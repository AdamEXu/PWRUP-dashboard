import { StatCard } from "@/components/ui/StatCard";

export function DriveTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <StatCard value="Swerve"    label="Drivetrain"        delay={0} />
        <StatCard value="Holonomic" label="Movement type"     delay={50} />
        <StatCard value="Field-rel" label="Control reference" delay={100} />
      </div>

      <p style={{
        fontFamily: "var(--f-inter)",
        fontSize: "0.95rem",
        lineHeight: 1.65,
        color: "var(--text-2)",
      }}>
        Swerve lets us translate in any direction while rotating freely. Field-relative control means the driver pushes toward the goal and the robot goes there — regardless of which way it is facing.
      </p>
    </div>
  );
}
