'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeumorphicCard } from '@/components/user/NeumorphicCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, CheckCircle, XCircle, ArrowRight, Trophy } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface QuizBattleProps {
  questions: QuizQuestion[];
  onComplete: (answers: number[]) => void;
  xpReward: number;
}

export function QuizBattle({ questions, onComplete, xpReward }: QuizBattleProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const handleAnswerSelect = (index: number) => {
    if (showResult || completed) return;
    setSelectedAnswer(index);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (selectedAnswer === questions[currentQuestion].correctIndex) {
      setScore(score + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setShowResult(true);
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      }, 2000);
    } else {
      // Quiz complete
      setCompleted(true);
      onComplete(newAnswers);
    }
  };

  const isCorrect = selectedAnswer === questions[currentQuestion].correctIndex;
  const question = questions[currentQuestion];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!completed ? (
        <>
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--neumorphic-muted)]">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-sm font-semibold text-[var(--neumorphic-text)]">
                Score: {score}/{questions.length}
              </span>
            </div>
            <div className="w-full h-2 bg-[var(--neumorphic-surface)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-600"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Question Card */}
          <NeumorphicCard variant="raised" className="p-6 mb-4">
            <h2 className="text-xl font-bold text-[var(--neumorphic-text)] mb-6">
              {question.question}
            </h2>

            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectAnswer = index === question.correctIndex;
                let buttonClass = 'w-full text-left p-4 rounded-lg transition-all ';

                if (showResult) {
                  if (isCorrectAnswer) {
                    buttonClass += 'bg-green-500/20 border-2 border-green-500';
                  } else if (isSelected && !isCorrectAnswer) {
                    buttonClass += 'bg-red-500/20 border-2 border-red-500';
                  } else {
                    buttonClass += 'bg-[var(--neumorphic-surface)] border border-[var(--neumorphic-border)]';
                  }
                } else {
                  buttonClass += isSelected
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border-2 border-cyan-500'
                    : 'bg-[var(--neumorphic-surface)] border border-[var(--neumorphic-border)] hover:border-cyan-500/50';
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult || completed}
                    className={buttonClass}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--neumorphic-text)] font-medium">
                        {option}
                      </span>
                      {showResult && isCorrectAnswer && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {showResult && isSelected && !isCorrectAnswer && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showResult && question.explanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
              >
                <p className="text-sm text-[var(--neumorphic-text)]">
                  <strong>Explanation:</strong> {question.explanation}
                </p>
              </motion.div>
            )}
          </NeumorphicCard>

          {/* Next Button */}
          {selectedAnswer !== null && (
            <Button
              onClick={handleNext}
              disabled={showResult && currentQuestion < questions.length - 1}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white"
            >
              {currentQuestion < questions.length - 1 ? (
                <>
                  Next Question
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                'Finish Quiz'
              )}
            </Button>
          )}
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <NeumorphicCard variant="raised" className="p-8 text-center">
            <Trophy className="h-20 w-20 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-[var(--neumorphic-text)] mb-2">
              Quiz Complete!
            </h2>
            <p className="text-xl text-[var(--neumorphic-muted)] mb-6">
              You scored {score} out of {questions.length}
            </p>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="text-lg font-semibold text-[var(--neumorphic-text)]">
                +{Math.floor(xpReward * (score / questions.length))} XP
              </span>
            </div>
            <Badge
              variant={score === questions.length ? 'default' : 'secondary'}
              className="text-lg px-4 py-2"
            >
              {score === questions.length
                ? 'Perfect Score! 🎉'
                : score >= questions.length * 0.7
                ? 'Great Job! 👍'
                : 'Keep Learning! 💪'}
            </Badge>
          </NeumorphicCard>
        </motion.div>
      )}
    </div>
  );
}

