'use client';

import Link from 'next/link';
import { Brain, Target, ArrowRight, Puzzle } from 'lucide-react';
import { Card } from '../../components/ui/Card';

const games = [
  {
    id: 'hypothesis-testing',
    title: '假设检验大师',
    description: '通过选择题学习如何设计对照实验，验证科研假设。涵盖机器人视觉、强化学习、SLAM 等多个领域。',
    icon: Brain,
    color: 'bg-blue-50 text-blue-600',
    questions: 6,
    difficulty: '中级',
  },
  {
    id: 'coming-soon-1',
    title: '变量控制挑战',
    description: '识别实验设计中的变量问题，学习如何控制混杂变量。',
    icon: Target,
    color: 'bg-gray-50 text-gray-400',
    questions: 0,
    difficulty: '即将上线',
    disabled: true,
  },
  {
    id: 'coming-soon-2',
    title: '样本量估算器',
    description: '学习如何根据效应量和显著性水平估算实验所需样本量。',
    icon: Puzzle,
    color: 'bg-gray-50 text-gray-400',
    questions: 0,
    difficulty: '即将上线',
    disabled: true,
  },
];

export default function GamesPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="page-title mb-2">科研训练游戏</h1>
        <p className="page-subtitle">
          通过交互式游戏学习科研方法论，提升实验设计能力
        </p>
      </div>

      <div className="space-y-4">
        {games.map((game) => (
          <Card
            key={game.id}
            className={`p-5 ${game.disabled ? 'opacity-60' : 'card-interactive'}`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl ${game.color} flex items-center justify-center flex-shrink-0`}>
                <game.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-ink">{game.title}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg2 text-muted font-medium">
                    {game.difficulty}
                  </span>
                </div>
                <p className="text-sm text-muted mt-1">{game.description}</p>
                {!game.disabled && (
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-xs text-muted">
                      {game.questions} 道题
                    </span>
                    <Link
                      href={`/games/${game.id}`}
                      className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-hover font-medium no-underline"
                    >
                      开始游戏
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center text-xs text-muted mt-8">
        <p>更多游戏正在开发中，敬请期待！</p>
      </div>
    </div>
  );
}
