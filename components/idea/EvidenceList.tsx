import { Evidence } from '../../lib/types';

interface EvidenceListProps {
  title: string;
  evidence: Evidence[];
  color: string;
  bgColor: string;
  onRemove?: (id: string) => void;
}

export function EvidenceList({ title, evidence, color, bgColor, onRemove }: EvidenceListProps) {
  return (
    <div className="rounded-lg p-3" style={{ backgroundColor: bgColor }}>
      <div className="font-semibold text-sm mb-2" style={{ color }}>{title}</div>
      <div className="space-y-2">
        {evidence.map((ev) => (
          <div key={ev.id} className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="text-xs">{ev.content}</div>
              <div className="text-xs opacity-60">{ev.source}</div>
              {ev.isAIGenerated && (
                <span className="inline-block ml-1 px-1 py-0.5 rounded text-[10px] bg-white/50 opacity-80">AI</span>
              )}
            </div>
            {onRemove && (
              <button
                onClick={() => onRemove(ev.id)}
                className="text-xs opacity-50 hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {evidence.length === 0 && (
          <div className="text-xs opacity-60">暂无证据</div>
        )}
      </div>
    </div>
  );
}
