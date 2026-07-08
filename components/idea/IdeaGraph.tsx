'use client';

import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { IdeaCard } from '../../lib/types';
import { useRouter } from 'next/navigation';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

const RELATIONSHIP_COLORS: Record<string, string> = {
  refines: '#22c55e',
  contradicts: '#ef4444',
  depends_on: '#3b82f6',
  derived_from: '#f59e0b',
};

const RELATIONSHIP_LABELS: Record<string, string> = {
  refines: '改进',
  contradicts: '矛盾',
  depends_on: '依赖',
  derived_from: '衍生',
};

interface GraphNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  idea: IdeaCard;
  radius: number;
}

interface GraphLink {
  source: GraphNode;
  target: GraphNode;
  type: string;
}

export function IdeaGraph() {
  const { state } = useApp();
  const router = useRouter();
  const [zoom, setZoom] = useState(1);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const { nodes, links, centerX, centerY, viewBox } = useMemo(() => {
    const ideas = state.ideaCards.filter(i => i.status !== 'rejected');
    const relationships = state.ideaRelationships;

    const width = 600;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;

    const nodes: GraphNode[] = ideas.map((idea, i) => {
      const angle = (i / Math.max(ideas.length, 1)) * Math.PI * 2;
      const radius = ideas.length > 1 ? 120 : 0;
      return {
        id: idea.id,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        idea,
        radius: 24 + idea.survivalScore * 0.1,
      };
    });

    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    const links: GraphLink[] = relationships
      .filter(r => nodeMap.has(r.sourceId) && nodeMap.has(r.targetId))
      .map(r => ({
        source: nodeMap.get(r.sourceId)!,
        target: nodeMap.get(r.targetId)!,
        type: r.relationshipType,
      }));

    for (let tick = 0; tick < 50; tick++) {
      const repulsion = 8000;
      const attraction = 0.02;
      const damping = 0.8;
      const centerPull = 0.005;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = repulsion / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          nodes[i].vx -= fx;
          nodes[i].vy -= fy;
          nodes[j].vx += fx;
          nodes[j].vy += fy;
        }
      }

      for (const link of links) {
        const dx = link.target.x - link.source.x;
        const dy = link.target.y - link.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - 100) * attraction;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        link.source.vx += fx;
        link.source.vy += fy;
        link.target.vx -= fx;
        link.target.vy -= fy;
      }

      for (const node of nodes) {
        node.vx += (centerX - node.x) * centerPull;
        node.vy += (centerY - node.y) * centerPull;
        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;
        node.x = Math.max(40, Math.min(width - 40, node.x));
        node.y = Math.max(40, Math.min(height - 40, node.y));
      }
    }

    const padding = 40;
    const viewBox = `${-padding} ${-padding} ${width + padding * 2} ${height + padding * 2}`;

    return { nodes, links, centerX, centerY, viewBox };
  }, [state.ideaCards, state.ideaRelationships]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#0d9488';
      case 'exploring': return '#d97706';
      case 'validated': return '#22c55e';
      case 'rejected': return '#ef4444';
      default: return '#78716c';
    }
  };

  const handleNodeClick = (ideaId: string) => {
    router.push(`/ideas?focus=${ideaId}`);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-ink">Idea 关联图谱</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}
            className="p-1.5 rounded-lg hover:bg-bg2 transition-fast"
            title="缩小"
          >
            <ZoomOut className="w-4 h-4 text-muted" />
          </button>
          <span className="text-xs text-muted w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(z => Math.min(2, z + 0.2))}
            className="p-1.5 rounded-lg hover:bg-bg2 transition-fast"
            title="放大"
          >
            <ZoomIn className="w-4 h-4 text-muted" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 rounded-lg hover:bg-bg2 transition-fast ml-1"
            title="重置"
          >
            <Maximize2 className="w-4 h-4 text-muted" />
          </button>
        </div>
      </div>

      <div className="relative w-full aspect-[3/2] bg-bg2/50 rounded-lg overflow-hidden">
        <svg
          viewBox={viewBox}
          className="w-full h-full"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#a8a29e" />
            </marker>
            {Object.entries(RELATIONSHIP_COLORS).map(([type, color]) => (
              <marker
                key={type}
                id={`arrowhead-${type}`}
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill={color} />
              </marker>
            ))}
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {links.map((link, i) => {
            const dx = link.target.x - link.source.x;
            const dy = link.target.y - link.source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const offset = link.target.radius + 4;
            const endX = link.target.x - (dx / dist) * offset;
            const endY = link.target.y - (dy / dist) * offset;

            const color = RELATIONSHIP_COLORS[link.type] || '#a8a29e';
            const isHighlighted = hoveredNode === link.source.id || hoveredNode === link.target.id;

            return (
              <g key={i}>
                <line
                  x1={link.source.x}
                  y1={link.source.y}
                  x2={endX}
                  y2={endY}
                  stroke={color}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                  strokeOpacity={hoveredNode && !isHighlighted ? 0.2 : 0.6}
                  markerEnd={`url(#arrowhead-${link.type})`}
                  className="transition-all duration-200"
                />
              </g>
            );
          })}

          {nodes.map(node => {
            const isHovered = hoveredNode === node.id;
            const statusColor = getStatusColor(node.idea.status);

            return (
              <g
                key={node.id}
                onClick={() => handleNodeClick(node.id)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.radius + 4}
                  fill="none"
                  stroke={statusColor}
                  strokeWidth={isHovered ? 3 : 2}
                  strokeOpacity={hoveredNode && !isHovered ? 0.3 : 0.8}
                  className="transition-all duration-200"
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.radius}
                  fill="white"
                  stroke={statusColor}
                  strokeWidth={1.5}
                  filter={isHovered ? 'url(#glow)' : undefined}
                  className="transition-all duration-200"
                />
                <text
                  x={node.x}
                  y={node.y - 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[9px] font-semibold fill-ink pointer-events-none"
                  style={{ opacity: hoveredNode && !isHovered ? 0.4 : 1 }}
                >
                  {node.idea.title.length > 6
                    ? node.idea.title.slice(0, 6) + '...'
                    : node.idea.title}
                </text>
                <text
                  x={node.x}
                  y={node.y + 8}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[7px] fill-muted pointer-events-none"
                  style={{ opacity: hoveredNode && !isHovered ? 0.4 : 1 }}
                >
                  {node.idea.survivalScore}%
                </text>
              </g>
            );
          })}
        </svg>

        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted text-sm">
            暂无 Idea 数据
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-border-subtle">
        {Object.entries(RELATIONSHIP_LABELS).map(([type, label]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div
              className="w-3 h-0.5 rounded-full"
              style={{ backgroundColor: RELATIONSHIP_COLORS[type] }}
            />
            <span className="text-[10px] text-muted">{label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mt-2">
        {[
          { status: 'active', label: '进行中' },
          { status: 'exploring', label: '探索中' },
          { status: 'validated', label: '已验证' },
        ].map(item => (
          <div key={item.status} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: getStatusColor(item.status) }}
            />
            <span className="text-[10px] text-muted">{item.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
