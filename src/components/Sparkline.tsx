import React, { useId } from 'react';

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({ data, color = '#00E676', height = 30, width = 100 }) => {
  const instanceId = useId();

  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const padding = 2;
  const innerHeight = height - padding * 2;
  const stepX = width / (data.length - 1 || 1);

  const points = data.map((val, idx) => {
    const x = idx * stepX;
    const y = height - padding - ((val - min) / range) * innerHeight;
    return `${x},${y}`;
  }).join(' ');

  const isNegative = data[data.length - 1] < data[0];
  const strokeColor = color !== '#00E676' ? color : (isNegative ? '#F44336' : '#00E676');

  const gradientId = `spark-grad-${instanceId}`;
  const areaPoints = `${points} ${width},${height} 0,${height}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <polyline points={areaPoints} fill={`url(#${gradientId})`} />
      <polyline points={points} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};
