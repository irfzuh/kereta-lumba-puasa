import React, { useEffect, useRef } from 'react';
import { Award, Home, RotateCcw, SunMedium } from 'lucide-react';
import { Difficulty, RaceOutcome } from '../types/game';

interface RoundSummaryProps {
  outcome: RaceOutcome;
  rankPosition: number | null;
  onPlayAgain: () => void;
  onViewLeaderboard: () => void;
  onGoHome: () => void;
}

interface ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  aspect: number;
  rot: number;
  vRot: number;
  color: string;
  alpha: number;
  swayPhase: number;
}

const TROPHY_META: Record<
  Difficulty,
  {
    diffLabel: string;
    trophyTitle: string;
    accentText: string;
    frameClass: string;
    screenGradient: string;
    confettiPalette: string[];
  }
> = {
  easy: {
    diffLabel: 'Santai',
    trophyTitle: 'Trofi Gangsa Sabit',
    accentText: 'text-amber-300',
    frameClass: 'border-amber-600/60 bg-gradient-to-br from-amber-950/90 via-slate-950 to-orange-950/70',
    screenGradient:
      'radial-gradient(circle at 50% 25%, rgba(217, 119, 6, 0.36), rgba(16, 185, 129, 0.16) 45%, rgba(15, 23, 42, 0) 78%)',
    confettiPalette: ['#F59E0B', '#FDE68A', '#10B981', '#FB923C', '#F8FAFC'],
  },
  medium: {
    diffLabel: 'Sederhana',
    trophyTitle: 'Trofi Perak Bintang',
    accentText: 'text-sky-300',
    frameClass: 'border-sky-400/60 bg-gradient-to-br from-sky-950/90 via-slate-950 to-indigo-950/70',
    screenGradient:
      'radial-gradient(circle at 50% 25%, rgba(56, 189, 248, 0.36), rgba(16, 185, 129, 0.18) 45%, rgba(15, 23, 42, 0) 78%)',
    confettiPalette: ['#38BDF8', '#E2E8F0', '#34D399', '#FBBF24', '#818CF8'],
  },
  hard: {
    diffLabel: 'Pantas',
    trophyTitle: 'Trofi Emas Diraja',
    accentText: 'text-yellow-300',
    frameClass: 'border-yellow-400/75 bg-gradient-to-br from-yellow-950/90 via-slate-950 to-emerald-950/70',
    screenGradient:
      'radial-gradient(circle at 50% 25%, rgba(250, 204, 21, 0.42), rgba(16, 185, 129, 0.22) 48%, rgba(15, 23, 42, 0) 80%)',
    confettiPalette: ['#FACC15', '#10B981', '#F43F5E', '#38BDF8', '#FEF08A', '#FFFFFF'],
  },
};

const DifficultyTrophySvg: React.FC<{ difficulty: Difficulty }> = ({ difficulty }) => {
  if (difficulty === 'easy') {
    return (
      <svg viewBox="0 0 96 96" className="w-20 h-20 sm:w-22 sm:h-22 lkr-trophy-float" aria-label="Trofi Gangsa Sabit Tahap Santai">
        <defs>
          <linearGradient id="bronzeCup" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDBA74" />
            <stop offset="48%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#7C2D12" />
          </linearGradient>
        </defs>
        <circle cx="48" cy="44" r="34" fill="rgba(217, 119, 6, 0.18)" />
        <path
          d="M28 28 H68 L63 50 C61 60 55 66 48 66 C41 66 35 60 33 50 Z"
          fill="url(#bronzeCup)"
          stroke="#FED7AA"
          strokeWidth="2"
        />
        <path d="M28 32 C18 32 18 48 29 48" fill="none" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M68 32 C78 32 78 48 67 48" fill="none" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
        <rect x="44" y="66" width="8" height="10" fill="#B45309" />
        <rect x="33" y="76" width="30" height="7" rx="3" fill="#92400E" stroke="#FDBA74" strokeWidth="1.5" />
        <path
          d="M52 38 A9 9 0 1 0 52 54 A7 7 0 1 1 52 38 Z"
          fill="#FEF3C7"
        />
      </svg>
    );
  }

  if (difficulty === 'medium') {
    return (
      <svg viewBox="0 0 96 96" className="w-20 h-20 sm:w-22 sm:h-22 lkr-trophy-float" aria-label="Trofi Perak Bintang Tahap Sederhana">
        <defs>
          <linearGradient id="silverCup" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="50%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
        </defs>
        <circle cx="48" cy="44" r="36" fill="rgba(56, 189, 248, 0.2)" />
        <path
          d="M25 26 H71 L65 51 C62 62 55 67 48 67 C41 67 34 62 31 51 Z"
          fill="url(#silverCup)"
          stroke="#E0F2FE"
          strokeWidth="2"
        />
        <path d="M26 30 C14 29 14 48 28 50" fill="none" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M70 30 C82 29 82 48 68 50" fill="none" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M48 14 L51 20 L58 21 L53 25 L54 32 L48 29 L42 32 L43 25 L38 21 L45 20 Z" fill="#38BDF8" stroke="#E0F2FE" strokeWidth="1.2" />
        <path d="M51 39 A8 8 0 1 0 51 53 A6.2 6.2 0 1 1 51 39 Z" fill="#0EA5E9" />
        <rect x="43" y="67" width="10" height="9" fill="#64748B" />
        <rect x="30" y="76" width="36" height="8" rx="3" fill="#1E293B" stroke="#94A3B8" strokeWidth="1.6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 96 96" className="w-20 h-20 sm:w-22 sm:h-22 lkr-trophy-float" aria-label="Trofi Emas Diraja Tahap Pantas">
      <defs>
        <linearGradient id="goldCup" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="45%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>
      <circle cx="48" cy="44" r="38" fill="rgba(250, 204, 21, 0.24)" />
      <path d="M16 34 L26 28 L28 45 L17 44 Z" fill="#FACC15" opacity="0.85" />
      <path d="M80 34 L70 28 L68 45 L79 44 Z" fill="#FACC15" opacity="0.85" />
      <path d="M29 22 L38 15 L48 22 L58 15 L67 22 L66 28 H30 Z" fill="#FDE047" stroke="#FEF9C3" strokeWidth="1.4" />
      <path
        d="M27 28 H69 L63 52 C60 63 54 68 48 68 C42 68 36 63 33 52 Z"
        fill="url(#goldCup)"
        stroke="#FEF9C3"
        strokeWidth="2"
      />
      <path d="M27 32 C15 31 15 51 30 52" fill="none" stroke="#FEF08A" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M69 32 C81 31 81 51 66 52" fill="none" stroke="#FEF08A" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M51 38 A8.5 8.5 0 1 0 51 54 A6.5 6.5 0 1 1 51 38 Z" fill="#78350F" />
      <circle cx="48" cy="46" r="3.2" fill="#10B981" stroke="#FEF9C3" strokeWidth="1" />
      <rect x="43" y="68" width="10" height="8" fill="#D97706" />
      <rect x="28" y="76" width="40" height="9" rx="3" fill="#78350F" stroke="#FACC15" strokeWidth="1.8" />
    </svg>
  );
};

export const RoundSummary: React.FC<RoundSummaryProps> = ({
  outcome,
  rankPosition,
  onPlayAgain,
  onViewLeaderboard,
  onGoHome,
}) => {
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isVictory = outcome.winner === 'player';
  const meta = TROPHY_META[outcome.difficulty];

  const totalAnswered = outcome.correctCount + outcome.wrongCount;
  const accuracy = totalAnswered > 0 ? Math.round((outcome.correctCount / totalAnswered) * 100) : 0;

  let titleText = 'Tahniah! Anda Menjuarai Perlumbaan!';
  let subtitleText = `Anda menewaskan AI Senja dan tiba di penamat dengan baki ${outcome.timeRemaining.toFixed(1)} saat sebelum matahari terbenam.`;

  if (outcome.winner === 'ai') {
    titleText = 'AI Senja Mendahului di Garisan Penamat';
    subtitleText =
      'Pelumba komputer mengekalkan kelajuan konsisten. Tingkatkan ketepatan jawapan untuk kuasa nitro berganda.';
  } else if (outcome.winner === 'sunset') {
    titleText = 'Matahari Telah Terbenam';
    subtitleText = `Waktu senja berakhir ketika anda berada pada jarak ${Math.round(outcome.playerDistance)}m. Jawab lebih pantas sebelum Maghrib.`;
  }

  useEffect(() => {
    if (!isVictory) return;
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const palette = meta.confettiPalette;
    const pieces: ConfettiPiece[] = [];

    const spawnWave = (count: number, originYRatio: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      for (let i = 0; i < count; i++) {
        const fromLeft = i % 2 === 0;
        const originX = fromLeft ? w * (0.15 + Math.random() * 0.25) : w * (0.6 + Math.random() * 0.25);
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.15;
        const speed = 5 + Math.random() * 8.5;
        pieces.push({
          x: originX,
          y: h * originYRatio,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          size: 5 + Math.random() * 6,
          aspect: 0.45 + Math.random() * 0.55,
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.22,
          color: palette[i % palette.length],
          alpha: 1,
          swayPhase: Math.random() * Math.PI * 2,
        });
      }
    };

    spawnWave(85, 0.55);
    const secondBurstId = window.setTimeout(() => spawnWave(65, 0.35), 480);

    let rafId = 0;
    const startMs = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startMs;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      for (let i = pieces.length - 1; i >= 0; i--) {
        const p = pieces[i];
        p.swayPhase += 0.08;
        p.vx *= 0.99;
        p.vy += 0.16;
        p.x += p.vx + Math.sin(p.swayPhase) * 0.7;
        p.y += p.vy;
        p.rot += p.vRot;
        if (elapsed > 3200) {
          p.alpha = Math.max(0, p.alpha - 0.02);
        }

        if (p.alpha <= 0 || p.y > h + 30) {
          pieces.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, (-p.size * p.aspect) / 2, p.size, p.size * p.aspect);
        ctx.restore();
      }

      if (pieces.length > 0 && elapsed < 5500) {
        rafId = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      window.clearTimeout(secondBurstId);
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [isVictory, meta.confettiPalette]);

  return (
    <>
      {isVictory && (
        <>
          <div
            aria-hidden="true"
            className="fixed inset-0 pointer-events-none z-35 lkr-victory-flash"
            style={{ background: meta.screenGradient }}
          />
          <canvas
            ref={confettiCanvasRef}
            aria-hidden="true"
            className="fixed inset-0 w-full h-full pointer-events-none z-40"
          />
        </>
      )}

      <div
        className={`relative z-30 max-w-3xl w-full mx-auto rounded-2xl border p-4 sm:p-6 transition-colors ${
          isVictory
            ? 'border-amber-400/70 bg-slate-900/88 shadow-2xl shadow-amber-500/20'
            : 'border-slate-800 bg-slate-900/90'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 pb-4 border-b border-slate-800">
          <div
            className={`w-24 h-24 sm:w-26 sm:h-26 rounded-xl border shrink-0 flex flex-col items-center justify-center p-1.5 ${
              isVictory ? `${meta.frameClass} lkr-trophy-pop` : 'border-slate-700 bg-slate-950'
            }`}
          >
            {isVictory ? (
              <DifficultyTrophySvg difficulty={outcome.difficulty} />
            ) : (
              <SunMedium className="w-10 h-10 text-amber-400" aria-hidden="true" />
            )}
          </div>

          <div className="text-center sm:text-left min-w-0">
            <div className={`text-xs font-medium mb-1 ${isVictory ? meta.accentText : 'text-amber-400'}`}>
              {outcome.playerName || 'Pelumba Tetamu'} ·{' '}
              {outcome.vehicle === 'car' ? outcome.carName || 'Kereta Sport' : 'Unta Gurun'} · Tahap{' '}
              {meta.diffLabel}
              {isVictory ? ` · ${meta.trophyTitle}` : ''}
              {rankPosition ? ` · #${rankPosition} Pendahulu` : ''}
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white text-balance">
              {titleText}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">{subtitleText}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-slate-800">
          <div>
            <div className="text-xs text-slate-400">Jumlah Skor</div>
            <div className="font-mono-num text-xl sm:text-2xl font-bold text-amber-400 mt-0.5">
              {outcome.score.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Ketepatan Kuiz</div>
            <div className="font-mono-num text-xl sm:text-2xl font-bold text-white mt-0.5">
              {accuracy}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {outcome.correctCount} betul · {outcome.wrongCount} salah
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Kelajuan Puncak</div>
            <div className="font-mono-num text-xl sm:text-2xl font-bold text-emerald-400 mt-0.5">
              {Math.round(outcome.topSpeed)}{' '}
              <span className="text-xs sm:text-sm font-normal text-slate-400">km/j</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Baki Masa Senja</div>
            <div className="font-mono-num text-xl sm:text-2xl font-bold text-white mt-0.5">
              {outcome.timeRemaining.toFixed(1)}s
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Award className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
            <span>Rekod perlumbaan telah disimpan ke Papan Pendahulu.</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onGoHome}
              className="min-h-10 px-3.5 py-2 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              <span>Home</span>
            </button>
            <button
              type="button"
              onClick={onViewLeaderboard}
              className="min-h-10 px-3.5 py-2 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Papan Pendahulu
            </button>
            <button
              type="button"
              onClick={onPlayAgain}
              className="min-h-10 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Main Semula</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

