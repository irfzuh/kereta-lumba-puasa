import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, Zap, PauseOctagon } from 'lucide-react';
import { PlayerBoostStatus, QuizQuestion } from '../types/game';

interface QuizPanelProps {
  question: QuizQuestion;
  questionNumber: number;
  selectedOption: number | null;
  boostStatus: PlayerBoostStatus;
  onAnswer: (optionIndex: number) => void;
}

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

export const QuizPanel: React.FC<QuizPanelProps> = ({
  question,
  questionNumber,
  selectedOption,
  boostStatus,
  onAnswer,
}) => {
  const isAnswered = selectedOption !== null;
  const isCorrect = selectedOption === question.correctIndex;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswered) return;
      const key = e.key.toUpperCase();
      if (key === '1' || key === 'A') onAnswer(0);
      else if (key === '2' || key === 'B') onAnswer(1);
      else if (key === '3' || key === 'C') onAnswer(2);
      else if (key === '4' || key === 'D') onAnswer(3);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, onAnswer]);

  return (
    <section
      aria-label="Soalan kuiz pantas"
      className="w-full shrink-0 rounded-xl bg-[#FAF7F2] text-slate-900 border border-amber-200/80 px-3 py-2.5 sm:px-4 sm:py-3"
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 truncate">
          <span>Soalan {questionNumber}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{question.category}</span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-semibold shrink-0">
          {boostStatus === 'nitro' && (
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <Zap className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Kuasa Nitro Aktif</span>
            </span>
          )}
          {boostStatus === 'stopped' && (
            <span className="inline-flex items-center gap-1 text-red-700">
              <PauseOctagon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Terhenti 2s</span>
            </span>
          )}
          {boostStatus === 'normal' && (
            <span className="text-slate-500 hidden sm:inline">Tekan A-D atau 1-4</span>
          )}
        </div>
      </div>

      <h2 className="font-display text-sm sm:text-base font-bold text-slate-900 leading-snug mb-2 line-clamp-2">
        {question.question}
      </h2>

      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
        {question.options.map((opt, idx) => {
          let btnStyle =
            'bg-white border-slate-200 text-slate-800 hover:border-amber-500 hover:bg-amber-50/70';
          if (isAnswered) {
            if (idx === question.correctIndex) {
              btnStyle = 'bg-emerald-50 border-emerald-600 text-emerald-950 font-semibold';
            } else if (idx === selectedOption) {
              btnStyle = 'bg-red-50 border-red-600 text-red-950';
            } else {
              btnStyle = 'bg-slate-50 border-slate-200 text-slate-400';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={isAnswered}
              onClick={() => onAnswer(idx)}
              className={`min-h-[38px] sm:min-h-[42px] w-full text-left px-2 sm:px-3 py-1.5 rounded-lg border transition-colors duration-150 flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-600 ${btnStyle} ${
                isAnswered ? 'cursor-default' : 'cursor-pointer'
              }`}
            >
              <span
                className={`font-mono-num text-[11px] font-bold w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                  isAnswered && idx === question.correctIndex
                    ? 'bg-emerald-600 text-white'
                    : isAnswered && idx === selectedOption
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {OPTION_KEYS[idx]}
              </span>
              <span className="text-[11px] sm:text-xs leading-tight flex-1 line-clamp-2">{opt}</span>
              {isAnswered && idx === question.correctIndex && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
              )}
              {isAnswered && idx === selectedOption && idx !== question.correctIndex && (
                <XCircle className="w-3.5 h-3.5 text-red-700 shrink-0" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      {/* Fixed-height single-line feedback strip prevents layout shift inside 500px iframe */}
      <div className="mt-1.5 pt-1.5 border-t border-amber-200/70 min-h-[20px] flex items-center gap-1.5 text-[11px] leading-tight">
        {isAnswered ? (
          <>
            {isCorrect ? (
              <Zap className="w-3.5 h-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
            ) : (
              <PauseOctagon className="w-3.5 h-3.5 text-red-700 shrink-0" aria-hidden="true" />
            )}
            <p className={`truncate ${isCorrect ? 'text-emerald-900' : 'text-red-900'}`}>
              <strong className="font-semibold">
                {isCorrect ? 'Betul! Pecutan Nitro:' : 'Salah! Berhenti 2s:'}
              </strong>{' '}
              {question.explanation}
            </p>
          </>
        ) : (
          <p className="text-slate-500 truncate">
            Jawab betul untuk kuasa Nitro · Jawab salah kenderaan berhenti 2 saat
          </p>
        )}
      </div>
    </section>
  );
};
