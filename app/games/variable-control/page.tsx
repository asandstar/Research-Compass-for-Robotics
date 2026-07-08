'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, ArrowLeft, CheckCircle, XCircle, Lightbulb, RefreshCw, Target, FlaskConical } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { variableControlQuestions, getRandomQuestions, VariableControlQuestion } from '@/lib/games/variableControl';

interface GameState {
  questions: VariableControlQuestion[];
  currentIndex: number;
  answers: Record<string, string>;
  showResult: boolean;
  selectedOption: string | null;
  completed: boolean;
}

function getTypeIcon(field: string) {
  switch (field) {
    case '机器人视觉':
    case '视觉语言模型':
      return <Target className="w-4 h-4" />;
    default:
      return <FlaskConical className="w-4 h-4" />;
  }
}

export default function VariableControlGamePage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>(() => ({
    questions: getRandomQuestions(5),
    currentIndex: 0,
    answers: {},
    showResult: false,
    selectedOption: null,
    completed: false,
  }));

  const currentQuestion = gameState.questions[gameState.currentIndex];
  const progress = ((gameState.currentIndex + (gameState.showResult ? 1 : 0)) / gameState.questions.length) * 100;

  const handleSelectOption = useCallback((optionId: string) => {
    if (gameState.showResult) return;
    setGameState((prev) => ({ ...prev, selectedOption: optionId }));
  }, [gameState.showResult]);

  const handleConfirm = useCallback(() => {
    if (!gameState.selectedOption) return;
    setGameState((prev) => ({
      ...prev,
      showResult: true,
      answers: { ...prev.answers, [currentQuestion.id]: prev.selectedOption! },
    }));
  }, [gameState.selectedOption, currentQuestion]);

  const handleNext = useCallback(() => {
    if (gameState.currentIndex < gameState.questions.length - 1) {
      setGameState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        showResult: false,
        selectedOption: null,
      }));
    } else {
      setGameState((prev) => ({ ...prev, completed: true }));
    }
  }, [gameState.currentIndex, gameState.questions.length]);

  const handleRestart = useCallback(() => {
    setGameState({
      questions: getRandomQuestions(5),
      currentIndex: 0,
      answers: {},
      showResult: false,
      selectedOption: null,
      completed: false,
    });
  }, []);

  const calculateScore = () => {
    let correct = 0;
    gameState.questions.forEach((q) => {
      const answer = gameState.answers[q.id];
      const correctOption = q.options.find((o) => o.isCorrect);
      if (correctOption && answer === correctOption.id) correct++;
    });
    return correct;
  };

  if (gameState.completed) {
    const score = calculateScore();
    const total = gameState.questions.length;
    const percentage = Math.round((score / total) * 100);

    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push('/games')}
          className="inline-flex items-center gap-2 text-caption text-muted hover:text-ink dark:hover:text-dark-ink transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          返回游戏列表
        </button>

        <Card className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-amber-500 dark:text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-ink dark:text-dark-ink mb-2">
            挑战完成！
          </h2>
          <p className="text-3xl font-bold text-accent mb-2">
            {score}/{total}
          </p>
          <p className="text-sm text-muted mb-6">
            正确率 {percentage}% — {percentage >= 80 ? '变量控制大师！' : percentage >= 60 ? '不错，继续练习！' : '建议复习实验设计基础知识'}
          </p>

          <div className="space-y-3 text-left">
            {gameState.questions.map((q, i) => {
              const answer = gameState.answers[q.id];
              const correctOption = q.options.find((o) => o.isCorrect);
              const isCorrect = correctOption ? answer === correctOption.id : false;
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
                    <p className="text-sm font-medium text-ink dark:text-dark-ink">
                      {i + 1}. {q.scenario}
                    </p>
                    {!isCorrect && correctOption && (
                      <p className="text-xs text-muted mt-1">
                        正确答案：{correctOption.text}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              再试一次
            </button>
            <button
              onClick={() => router.push('/games')}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-border-default rounded-lg hover:bg-bg2 transition-colors text-sm"
            >
              返回列表
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.push('/games')}
        className="inline-flex items-center gap-2 text-caption text-muted hover:text-ink dark:hover:text-dark-ink transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回游戏列表
      </button>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-caption text-muted mb-2">
          <span>题目 {gameState.currentIndex + 1}/{gameState.questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-border-subtle dark:bg-dark-border-subtle rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <Card className="p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 font-medium">
            {getTypeIcon(currentQuestion.field)}
            {currentQuestion.field}
          </span>
        </div>

        <h2 className="text-base font-semibold text-ink dark:text-dark-ink mb-4 leading-relaxed">
          {currentQuestion.scenario}
        </h2>

        <div className="p-4 bg-bg2 dark:bg-dark-bg2 rounded-lg mb-6">
          <p className="text-sm text-muted leading-relaxed">
            {currentQuestion.experiment}
          </p>
        </div>

        <p className="text-sm font-medium text-ink dark:text-dark-ink mb-3">
          这个实验设计是否合理？
        </p>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = gameState.selectedOption === option.id;
            const isCorrect = option.isCorrect;
            let borderColor = 'border-border-subtle dark:border-dark-border-subtle';
            let bgColor = '';
            if (gameState.showResult) {
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
                onClick={() => handleSelectOption(option.id)}
                disabled={gameState.showResult}
                className={`w-full text-left p-4 rounded-lg border ${borderColor} ${bgColor} transition-all ${
                  !gameState.showResult ? 'hover:border-accent hover:bg-accent/5 dark:hover:bg-accent/10' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5 ${
                    isSelected
                      ? 'border-accent bg-accent text-white'
                      : 'border-border-default dark:border-dark-border-default text-muted'
                  }`}>
                    {option.id.toUpperCase()}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-ink dark:text-dark-ink">{option.text}</p>
                    {gameState.showResult && (
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

        {/* Hint */}
        {gameState.showResult && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
            <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400">{currentQuestion.hint}</p>
          </div>
        )}
      </Card>

      {/* Actions */}
      <div className="flex justify-end">
        {!gameState.showResult ? (
          <button
            onClick={handleConfirm}
            disabled={!gameState.selectedOption}
            className="px-5 py-2.5 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            确认答案
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-5 py-2.5 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors text-sm font-medium"
          >
            {gameState.currentIndex < gameState.questions.length - 1 ? '下一题' : '查看结果'}
          </button>
        )}
      </div>
    </div>
  );
}
