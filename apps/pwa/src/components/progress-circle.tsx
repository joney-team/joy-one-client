type ProgressCircleProps = {
  percent: number; // 0 → 100
  color?: string;
};

export const ProgressCircle: React.FC<ProgressCircleProps> = (props) => {
  const radius = 2;
  const circumference = 2 * Math.PI * radius; // ≈ 12.566
  const offset = circumference * (1 - props.percent / 100);

  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" color={props.color}>
      {/* Outer static circle */}
      <circle
        cx="7"
        cy="7"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3.14 0"
        strokeDashoffset="-0.7"
      />
      {/* Inner animated circle */}
      <circle
        cx="7"
        cy="7"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 7 7)"
        style={{ transition: "stroke-dashoffset 0.3s ease" }}
      />
    </svg>
  );
};
