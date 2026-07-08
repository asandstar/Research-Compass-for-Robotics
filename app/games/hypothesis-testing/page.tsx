'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Brain, CheckCircle, XCircle, Lightbulb, ArrowLeft, RotateCcw, Trophy, Target } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { getRandomQuestions, HypothesisQuestion } from '../../../lib/games/hypothesisTesting';

interface AnswerState {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  showExplanation: boolean;
}

export default function HypothesisTestingGame() {
  const [questions, setQuestions] = useState<HypothesisQuestion[]>(getRandomQuestions(5));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [gameFinished, setGameFinished] = useState(false);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id);
  const hasAnswered = !!currentAnswer;

  const score = answers.filter(a => a.isCorrect).length;
  const totalQuestions = questions.length;

  const handleSelect = useCallback((optionId: string) => {
    if (hasAnswered) return;

    const option = currentQuestion.options.find(o => o.id === optionId);
    if (!option) return;

    const answer: AnswerState = {
      questionId: currentQuestion.id,
      selectedOptionId: optionId,
      isCorrect: option.isCorrect,
      showExplanation: true,
    };

    setAnswers(prev => [...prev, answer]);
  }, [currentQuestion, hasAnswered]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setGameFinished(true);
    }
  }, [currentIndex, totalQuestions]);

  const handleRestart = useCallback(() => {
    setQuestions(getRandomQuestions(5));
    setCurrentIndex(0);
    setAnswers([]);
    setGameFinished(false);
  }, []);

  const getScoreMessage = () => {
    const ratio = score / totalQuestions;
    if (ratio === 1) return '完美！你是假设检验大师！';
    if (ratio >= 0.8) return '优秀！你的实验设计能力很强！';
    if (ratio >= 0.6) return '不错！继续练习会更好！';
    return '继续加油！掌握实验设计是科研的基本功。';
  };

  if (gameFinished) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/games" className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent transition-fast no-underline">
          <ArrowLeft className="w-4 h-4" />
          返回游戏列表
        </Link>

        <Card className="text-center p-8">
          <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-amber-500 dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-ink mb-2">游戏结束</h1>
          <p className="text-lg text-muted mb-2">
            得分：<span className="font-bold text-accent">{score}</span> / {totalQuestions}
          </p>
          <p className="text-sm text-muted mb-6">{getScoreMessage()}</p>

          <div className="space-y-3 mb-6">
            {questions.map((q, idx) => {
              const answer = answers.find(a => a.questionId === q.id);
              const isCorrect = answer?.isCorrect ?? false;
              return (
                <div
                  key={q.id}
                  className={`flex items-center gap-3 p-3 rounded-lg text-left ${
                    isCorrect ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30'
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{idx + 1}. {q.hypothesis.slice(0, 40)}...</p>
                    <p className="text-xs text-muted">{q.field}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-3">
            <Button onClick={handleRestart}>
              <RotateCcw className="w-4 h-4" />
              再玩一次
            </Button>
            <Link href="/games" className="no-underline hover:no-underline">
              <Button variant="secondary">返回游戏列表</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/games" className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent transition-fast no-underline">
          <ArrowLeft className="w-4 h-4" />
          返回游戏列表
        </Link>
        <div className="text-sm text-muted">
          第 {currentIndex + 1} / {totalQuestions} 题
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full bg-bg2 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + (hasAnswered ? 1 : 0)) / totalQuestions) * 100}%` }}
        />
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-accent/10 text-accent text-xs font-medium">
            <Target className="w-3 h-3" />
            {currentQuestion.field}
          </span>
        </div>

        <h2 className="text-lg font-semibold text-ink mb-3">
          假设：{currentQuestion.hypothesis}
        </h2>

        <div className="bg-bg2 rounded-lg p-4 mb-6">
          <p className="text-sm text-muted">
            <span className="font-medium text-ink">场景：</span>
            {currentQuestion.scenario}
          </p>
        </div>

        <p className="text-sm font-medium text-ink mb-3">
          以下哪种实验设计最能验证这个假设？
        </p>

        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = currentAnswer?.selectedOptionId === option.id;
            const showResult = hasAnswered;
            const isCorrect = option.isCorrect;

            let borderColor = 'border-border-subtle dark:border-dark-border-subtle';
            let bgColor = '';
            if (showResult) {
              if (isCorrect) {
                borderColor = 'border-green-400 dark:border-green-600';
                bgColor = 'bg-green-50 dark:bg-green-950/30';
              } else if (isSelected) {
                borderColor = 'border-red-400 dark:border-red-600';
                bgColor = 'bg-red-50 dark:bg-red-950/30';
              }
            } else if (isSelected) {
              borderColor = 'border-accent';
              bgColor = 'bg-accent/5 dark:bg-accent/10';
            }

            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                disabled={hasAnswered}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${borderColor} ${bgColor} ${
                  !hasAnswered ? 'hover:border-accent hover:bg-accent/5 cursor-pointer' : 'cursor-default'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isSelected ? 'border-accent bg-accent text-white' : 'border-muted'
                  }`}>
                    {isSelected && <CheckCircle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-ink">{option.text}</p>
                    {showResult && (
                      <div className={`mt-2 p-2 rounded text-xs ${
                        isCorrect ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400' : isSelected ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400' : 'text-muted'
                      }`}>
                        {option.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {!hasAnswered && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
            <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400">{currentQuestion.hint}</p>
          </div>
        )}

        {hasAnswered && (
          <div className="mt-6 flex justify-end">
            <Button onClick={handleNext}>
              {currentIndex < totalQuestions - 1 ? '下一题' : '查看结果'}
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Button>
          </div>
        )}
      </Card>

      <div className="text-center text-xs text-muted">
        当前得分：{score} / {answers.length} 题已答
      </div>
    </div>
  );
}
