'use client';

interface EvidencePressureGaugeProps {
  survivalScore: number;
  confidenceScore: number;
  falsificationStrength: number;
  forCount: number;
  againstCount: number;
  missingCount: number;
}

export function EvidencePressureGauge({
  survivalScore,
  confidenceScore,
  falsificationStrength,
  forCount,
  againstCount,
  missingCount,
}: EvidencePressureGaugeProps) {
  const total = forCount + againstCount + missingCount;

  const forPercent = total > 0 ? (forCount / total) * 100 : 0;
  const againstPercent = total > 0 ? (againstCount / total) * 100 : 0;
  const missingPercent = total > 0 ? (missingCount / total) * 100 : 0;

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-green-500 dark:bg-green-600';
    if (score >= 40) return 'bg-amber-500 dark:bg-amber-600';
    return 'bg-red-500 dark:bg-red-600';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 40) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">证据分布</span>
        <span className="text-ink font-medium">共 {total} 条</span>
      </div>

      <div className="h-3 w-full rounded-full overflow-hidden bg-bg2 flex">
        <div
          className="h-full bg-green-500 dark:bg-green-600 transition-all duration-500"
          style={{ width: `${forPercent}%` }}
        />
        <div
          className="h-full bg-red-500 dark:bg-red-600 transition-all duration-500"
          style={{ width: `${againstPercent}%` }}
        />
        <div
          className="h-full bg-amber-500 dark:bg-amber-600 transition-all duration-500"
          style={{ width: `${missingPercent}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-2">
          <p className="text-lg font-bold text-green-600 dark:text-green-400">{forCount}</p>
          <p className="text-[10px] text-green-700 dark:text-green-500">支持</p>
        </div>
        <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-2">
          <p className="text-lg font-bold text-red-600 dark:text-red-400">{againstCount}</p>
          <p className="text-[10px] text-red-700 dark:text-red-500">反对</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-2">
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{missingCount}</p>
          <p className="text-[10px] text-amber-700 dark:text-amber-500">缺失</p>
        </div>
      </div>

      <div className="pt-3 border-t border-border-subtle space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted">存活度</span>
            <span className={`text-xs font-semibold ${getScoreTextColor(survivalScore)}`}>
              {survivalScore}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-bg2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getScoreColor(survivalScore)}`}
              style={{ width: `${survivalScore}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted">置信度</span>
            <span className={`text-xs font-semibold ${getScoreTextColor(confidenceScore)}`}>
              {confidenceScore}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-bg2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getScoreColor(confidenceScore)}`}
              style={{ width: `${confidenceScore}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted">证伪强度</span>
            <span className={`text-xs font-semibold ${getScoreTextColor(falsificationStrength)}`}>
              {falsificationStrength}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-bg2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getScoreColor(falsificationStrength)}`}
              style={{ width: `${falsificationStrength}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
