interface RadarChartProps {
  survivalScore: number;
  confidenceScore: number;
  falsificationStrength: number;
}

export function RadarChart({ survivalScore, confidenceScore, falsificationStrength }: RadarChartProps) {
  const centerX = 100;
  const centerY = 100;
  const radius = 70;

  const data = [
    { value: survivalScore, label: '存活度', color: '#3b82f6', angle: 0 },
    { value: confidenceScore, label: '置信度', color: '#22c55e', angle: 120 },
    { value: falsificationStrength, label: '证伪强度', color: '#f59e0b', angle: 240 },
  ];

  const toCartesian = (angle: number, r: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: centerX + r * Math.cos(rad),
      y: centerY + r * Math.sin(rad),
    };
  };

  const dataPoints = data.map((d) => {
    const r = (d.value / 100) * radius;
    return toCartesian(d.angle, r);
  });

  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  const axisLines = data.map((d) => {
    const end = toCartesian(d.angle, radius);
    return { x1: centerX, y1: centerY, x2: end.x, y2: end.y };
  });

  const gridCircles = [25, 50, 75, 100].map((percent) => ({
    r: (percent / 100) * radius,
    opacity: 0.15 + percent * 0.002,
  }));

  const labelPositions = data.map((d) => {
    const r = radius + 20;
    return toCartesian(d.angle, r);
  });

  return (
    <div className="relative w-full max-w-[240px] mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-auto">
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d9488" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0d9488" stopOpacity="0.1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {gridCircles.map((circle, i) => (
          <circle
            key={i}
            cx={centerX}
            cy={centerY}
            r={circle.r}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted/30"
          />
        ))}

        {axisLines.map((line, i) => (
          <line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted/30"
          />
        ))}

        <polygon
          points={polygonPoints}
          fill="url(#radarGradient)"
          stroke="#0d9488"
          strokeWidth="2"
          filter="url(#glow)"
          className="dark:stroke-[#2dd4bf]"
        />

        {dataPoints.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="5"
            fill={data[i].color}
            stroke="white"
            strokeWidth="2"
            className="dark:stroke-[#1c1917]"
          />
        ))}

        {labelPositions.map((pos, i) => (
          <text
            key={i}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs font-medium text-ink dark:text-dark-ink"
            fill="currentColor"
          >
            {data[i].label}
          </text>
        ))}

        {dataPoints.map((point, i) => (
          <text
            key={`value-${i}`}
            x={point.x}
            y={point.y - 10}
            textAnchor="middle"
            className="text-xs font-bold"
            fill={data[i].color}
          >
            {data[i].value}
          </text>
        ))}
      </svg>

      <div className="flex justify-center gap-4 mt-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-xs text-muted">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
