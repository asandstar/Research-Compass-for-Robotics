'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/ui/Card';
import { Tag } from '../../components/ui/Tag';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { MVE_RESULT_LABELS } from '../../lib/types';
import { Search, FlaskConical, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

export default function MvesPage() {
  const { state, getIdeaCardById } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'pending', label: '待验证' },
    { value: 'passed', label: '通过' },
    { value: 'failed', label: '失败' },
  ];

  const filteredMVEs = useMemo(() => {
    return state.mves.filter(mve => {
      const ideaCard = getIdeaCardById(mve.ideaCardId);
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          (ideaCard && ideaCard.title.toLowerCase().includes(query)) ||
          mve.roboticsTask.toLowerCase().includes(query) ||
          (mve.datasetOrScenario && mve.datasetOrScenario.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }
      // Status filter
      if (statusFilter !== 'all' && mve.resultStatus !== statusFilter) return false;
      return true;
    });
  }, [state.mves, searchQuery, statusFilter, getIdeaCardById]);

  const stats = {
    total: state.mves.length,
    pending: state.mves.filter(m => m.resultStatus === 'pending').length,
    passed: state.mves.filter(m => m.resultStatus === 'passed').length,
    failed: state.mves.filter(m => m.resultStatus === 'failed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">MVEs</h1>
          <p className="text-gray-600 mt-1">最小可行实验追踪</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-gray-600">
            <FlaskConical className="w-5 h-5" />
            <span className="text-sm">总 MVE</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">待验证</span>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm">通过</span>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.passed}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">失败</span>
          </div>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.failed}</p>
        </Card>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="搜索 MVE 关联 Idea、任务..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
          placeholder="筛选状态"
          width="180px"
        />
      </div>

      <div className="space-y-3">
        {filteredMVEs.length === 0 ? (
          <Card className="p-8 text-center">
            <FlaskConical className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">暂无 MVE</p>
            <p className="text-sm text-gray-400 mt-1">在 Idea 详情页点击"生成 MVE"创建第一个实验</p>
          </Card>
        ) : (
          filteredMVEs.map((mve) => {
            const label = MVE_RESULT_LABELS[mve.resultStatus];
            const ideaCard = getIdeaCardById(mve.ideaCardId);
            return (
              <Link key={mve.id} href={`/detail/mve/${mve.id}`} className="no-underline hover:no-underline block">
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">
                          {ideaCard ? ideaCard.title : '未知 Idea'}
                        </h3>
                        <Tag
                          size="sm"
                          color={label.color}
                          bgColor={label.bgColor}
                        >
                          {label.label}
                        </Tag>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FlaskConical className="w-4 h-4" />
                          {mve.roboticsTask || '未指定任务'}
                        </span>
                        <span>{mve.datasetOrScenario || '未指定数据集'}</span>
                        <span>{mve.baseline || '未指定基线'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{new Date(mve.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
