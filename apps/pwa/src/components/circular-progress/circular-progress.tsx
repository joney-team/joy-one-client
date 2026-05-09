import config from "@joy-one/config";

interface CircularProgressProps {
  progress: number; // 0 to 1
  size?: number;
  color?: string;
  strokeWidth?: number;
  gap?: number;
  borderType?: "solid" | "dashed";
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 16,
  color = config.PRIMARY_COLOR,
  strokeWidth = 1.6,
  gap = 2.6,
  borderType = "solid",
}) => {
  // Clamp progress between 0 and 1
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  // Calculate circle properties
  const center = size / 2;
  const outerRadius = (size - strokeWidth) / 2;
  const innerRadius = outerRadius - gap;

  // Calculate the angle for the progress arc
  const angle = clampedProgress * 360;

  // Calculate the path for the progress fill
  const startAngle = -90; // Start from top
  const endAngle = startAngle + angle;

  const startX = center + innerRadius * Math.cos((startAngle * Math.PI) / 180);
  const startY = center + innerRadius * Math.sin((startAngle * Math.PI) / 180);
  const endX = center + innerRadius * Math.cos((endAngle * Math.PI) / 180);
  const endY = center + innerRadius * Math.sin((endAngle * Math.PI) / 180);

  const largeArcFlag = angle > 180 ? 1 : 0;

  const pathData =
    clampedProgress === 0
      ? ""
      : clampedProgress === 1
        ? `M ${center},${center} m 0,-${innerRadius} a ${innerRadius},${innerRadius} 0 1,1 0,${
            innerRadius * 2
          } a ${innerRadius},${innerRadius} 0 1,1 0,-${innerRadius * 2}`
        : `M ${center},${center} L ${startX},${startY} A ${innerRadius},${innerRadius} 0 ${largeArcFlag},1 ${endX},${endY} Z`;

  // Calculate stroke dash array for dashed border
  const circumference = 2 * Math.PI * outerRadius;
  const dashLength = circumference / 20; // Adjust this for dash size
  const strokeDasharray = borderType === "dashed" ? `${dashLength} ${dashLength * 0.8}` : "none";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Progress fill */}
      <path
        d={pathData}
        fill={color}
        style={{
          transition: "all 0.3s ease",
        }}
      />

      {/* Border circle (always full) */}
      <circle
        cx={center}
        cy={center}
        r={outerRadius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
      />
    </svg>
  );
};
