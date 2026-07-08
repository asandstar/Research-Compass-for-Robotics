'use client';

import { useState } from 'react';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import { READING_STATUS_LABELS, JUDGEMENT_LABELS } from '../../lib/types';
import type { Paper } from '../../lib/types';
import { ExternalLink, FileText, Lightbulb, Edit3, Sparkles, ChevronDown, ChevronUp, AlertTriangle, Target, BookOpen, CheckCircle2, HelpCircle, Microscope, Search } from 'lucide-react';

interface PaperCardProps {
  paper: Paper;
  getAreaName: (areaId: string) => string;
  onEdit?: (paper: Paper) => void;
  onGenerateIdea?: (paperId: string) => void;
  isGeneratingIdea?: boolean;
  onExtractAssumptions?: (paper: Paper) => void;
  onExtractGaps?: (paper: Paper) => void;
  compact?: boolean;
}

export function PaperCard({ paper, getAreaName, onEdit, onGenerateIdea, isGeneratingIdea, onExtractAssumptions, onExtractGaps, compact = false }: PaperCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (compact) {
    return (
      <Card key={paper.id} className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{paper.title}</h4>
            <p className="text-sm text-gray-500 mt-0.5">
              {paper.authors.split(',')[0]} et al. · {paper.year} · {paper.venue}
            </p>
            {paper.oneSentenceSummary && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {paper.oneSentenceSummary}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <Tag
              size="sm"
              color={READING_STATUS_LABELS[paper.readingStatus].color}
              bgColor={READING_STATUS_LABELS[paper.readingStatus].bgColor}
            >
              {READING_STATUS_LABELS[paper.readingStatus].label}
            </Tag>
            <Tag
              size="sm"
              color={JUDGEMENT_LABELS[paper.judgementLevel].color}
              bgColor={JUDGEMENT_LABELS[paper.judgementLevel].bgColor}
            >
              {JUDGEMENT_LABELS[paper.judgementLevel].label}
            </Tag>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
          {paper.arxivUrl && (
            <a
              href={paper.arxivUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-accent flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              arXiv
            </a>
          )}
          {paper.feishuNoteUrl && (
            <a
              href={paper.feishuNoteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-accent flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              飞书笔记
            </a>
          )}
          {paper.codeUrl && (
            <a
              href={paper.codeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-accent flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              代码
            </a>
          )}
          {paper.inspiredIdeaIds.length > 0 && (
            <span className="text-xs text-gray-400 ml-auto">
              关联 {paper.inspiredIdeaIds.length} 个 Idea
            </span>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card key={paper.id} className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base">
            {paper.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {paper.authors} · {paper.year} · {paper.venue}
          </p>
          
          {paper.oneSentenceSummary && (
            <p className="text-sm text-gray-700 mt-3 bg-bg2 p-3 rounded-lg border-l-2 border-accent/40">
              {paper.oneSentenceSummary}
            </p>
          )}

          <div className="flex flex-wrap gap-1.5 mt-3">
            {paper.areaIds.map(areaId => (
              <Tag key={areaId} size="sm" variant="secondary">
                {getAreaName(areaId)}
              </Tag>
            ))}
            {paper.methodKeywords.slice(0, 4).map((kw, i) => (
              <Tag key={i} size="sm">
                {kw}
              </Tag>
            ))}
          </div>

          {paper.relevanceToMyResearch && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 font-medium">和我研究的关系</p>
              <p className="text-sm text-gray-700 mt-0.5">{paper.relevanceToMyResearch}</p>
            </div>
          )}

          {(paper.problem || paper.coreContribution || paper.methodSketch) && (
            <>
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-4 text-sm text-accent hover:text-accent-hover flex items-center gap-1"
              >
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {expanded ? '收起' : '展开'} 详细信息
              </button>
              
              {expanded && (
                <div className="space-y-4 mt-4 pt-4 border-t border-gray-100">
                  {paper.problem && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-400">问题定义</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{paper.problem}</p>
                    </div>
                  )}

                  {paper.coreContribution && (
                    <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-xs font-medium text-green-700 dark:text-green-400">核心贡献</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{paper.coreContribution}</p>
                    </div>
                  )}

                  {paper.methodSketch && (
                    <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-medium text-purple-700 dark:text-purple-400">方法概述</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{paper.methodSketch}</p>
                    </div>
                  )}

                  {(Boolean(paper.evidence?.tasks?.length) ||
                    Boolean(paper.evidence?.baselines?.length) ||
                    Boolean(paper.evidence?.metrics?.length) ||
                    Boolean(paper.evidence?.keyResults?.length)) && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">证据信息</p>
                      <div className="grid grid-cols-2 gap-3">
                        {paper.evidence?.tasks?.length > 0 && (
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">测试任务</p>
                            <div className="flex flex-wrap gap-1">
                              {paper.evidence.tasks.map((t, i) => (
                                <span key={i} className="text-xs bg-white dark:bg-dark-surface px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {paper.evidence?.baselines?.length > 0 && (
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">基线方法</p>
                            <div className="flex flex-wrap gap-1">
                              {paper.evidence.baselines.map((b, i) => (
                                <span key={i} className="text-xs bg-white dark:bg-dark-surface px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                                  {b}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {paper.evidence?.metrics?.length > 0 && (
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">评估指标</p>
                            <div className="flex flex-wrap gap-1">
                              {paper.evidence.metrics.map((m, i) => (
                                <span key={i} className="text-xs bg-white dark:bg-dark-surface px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                                  {m}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {paper.evidence?.keyResults?.length > 0 && (
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">关键结果</p>
                            <div className="flex flex-wrap gap-1">
                              {paper.evidence.keyResults.map((r, i) => (
                                <span key={i} className="text-xs bg-white dark:bg-dark-surface px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                                  {r}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {paper.assumptions?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">假设前提</p>
                      <ul className="space-y-1">
                        {paper.assumptions.map((a, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-gray-400 mt-0.5">•</span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(paper.limitations?.length || paper.limitationsOrQuestions) && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-xs font-medium text-amber-700 dark:text-amber-400">局限与疑问</span>
                      </div>
                      {paper.limitations?.length ? (
                        <ul className="space-y-1">
                          {paper.limitations.map((l, i) => (
                            <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                              <span className="text-amber-400 mt-0.5">•</span>
                              {l}
                            </li>
                          ))}
                        </ul>
                      ) : paper.limitationsOrQuestions ? (
                        <p className="text-sm text-gray-700 dark:text-gray-300">{paper.limitationsOrQuestions}</p>
                      ) : null}
                    </div>
                  )}

                  {paper.questionsToVerify?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <HelpCircle className="w-4 h-4 text-accent" />
                        <p className="text-xs font-medium text-gray-500">待验证问题</p>
                      </div>
                      <ul className="space-y-1">
                        {paper.questionsToVerify.map((q, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-accent/50 mt-0.5">?</span>
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
            {paper.arxivUrl && (
              <a
                href={paper.arxivUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-accent flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                arXiv
              </a>
            )}
            {paper.pdfUrl && (
              <a
                href={paper.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-accent flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                PDF
              </a>
            )}
            {paper.feishuNoteUrl && (
              <a
                href={paper.feishuNoteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-accent flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                飞书笔记
              </a>
            )}
            {paper.codeUrl && (
              <a
                href={paper.codeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-accent flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                代码
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="flex flex-col items-end gap-1.5">
            <Tag
              size="sm"
              color={READING_STATUS_LABELS[paper.readingStatus].color}
              bgColor={READING_STATUS_LABELS[paper.readingStatus].bgColor}
            >
              {READING_STATUS_LABELS[paper.readingStatus].label}
            </Tag>
            <Tag
              size="sm"
              color={JUDGEMENT_LABELS[paper.judgementLevel].color}
              bgColor={JUDGEMENT_LABELS[paper.judgementLevel].bgColor}
            >
              {JUDGEMENT_LABELS[paper.judgementLevel].label}
            </Tag>
          </div>
          
          <div className="text-xs text-gray-400 flex items-center gap-1 mt-2">
            <Lightbulb className="w-3.5 h-3.5" />
            {paper.inspiredIdeaIds.length} 个 Idea
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            {onEdit && (
              <button
                onClick={() => onEdit(paper)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded self-end"
                title="编辑"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {onExtractAssumptions && (
              <button
                onClick={() => onExtractAssumptions(paper)}
                className="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded flex items-center gap-1"
                title="提取假设"
              >
                <Microscope className="w-3.5 h-3.5" />
                提取假设
              </button>
            )}
            {onExtractGaps && (
              <button
                onClick={() => onExtractGaps(paper)}
                className="px-2 py-1 text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded flex items-center gap-1"
                title="分析缺口"
              >
                <Search className="w-3.5 h-3.5" />
                分析缺口
              </button>
            )}
            {onGenerateIdea && (
              <button
                onClick={() => onGenerateIdea(paper.id)}
                disabled={isGeneratingIdea}
                className="px-2 py-1 text-xs text-accent hover:bg-accent/[0.06] rounded flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                title="生成 Idea"
              >
                <Sparkles className="w-3.5 h-3.5" />
                生成 Idea
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}