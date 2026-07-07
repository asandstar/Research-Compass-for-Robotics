'use client';

import { GraduationCap } from 'lucide-react';
import LearningPathCard from '../../components/learning/LearningPathCard';
import { learningPaths } from '../../lib/learning/learningPaths';

export default function LearningPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="page-title">Learning Paths</h1>
            <p className="page-subtitle">从入门到前沿：机器人、VLA、具身智能等方向的系统化学习路径，每条路径包含 Level 0-4 渐进式学习规划、推荐论文与建议输出物。</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {learningPaths.map((path) => (
          <LearningPathCard key={path.id} path={path} />
        ))}
      </div>
    </div>
  );
}
