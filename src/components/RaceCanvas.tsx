import React, { useEffect, useRef, useState } from 'react';
import { Zap } from 'lucide-react';
import { NITRO_BOOST_IMAGE_PATH } from '../data/vehicles';
import { CarOption, PlayerBoostStatus, VehicleType } from '../types/game';

interface RaceCanvasProps {
  playerVehicle: VehicleType;
  selectedCar: CarOption;
  playerDistance: number;
  aiDistance: number;
  finishDistance: number;
  playerSpeed: number;
  aiSpeed: number;
  bgOffset: number;
  boostStatus: PlayerBoostStatus;
  timeRemaining: number;
  totalTime: number;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function lerpColor(c1: [number, number, number], c2: [number, number, number], t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const r = Math.round(lerp(c1[0], c2[0], clamped));
  const g = Math.round(lerp(c1[1], c2[1], clamped));
  const b = Math.round(lerp(c1[2], c2[2], clamped));
  return `rgb(${r}, ${g}, ${b})`;
}

export const RaceCanvas: React.FC<RaceCanvasProps> = ({
  playerVehicle,
  selectedCar,
  playerDistance,
  aiDistance,
  finishDistance,
  playerSpeed,
  aiSpeed,
  bgOffset,
  boostStatus,
  timeRemaining,
  totalTime,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [nitroImgFailed, setNitroImgFailed] = useState(false);
  const [carThumbFailed, setCarThumbFailed] = useState(false);

  const stateRef = useRef({
    playerVehicle,
    selectedCar,
    playerDistance,
    aiDistance,
    finishDistance,
    playerSpeed,
    aiSpeed,
    bgOffset,
    boostStatus,
    timeRemaining,
    totalTime,
  });

  stateRef.current = {
    playerVehicle,
    selectedCar,
    playerDistance,
    aiDistance,
    finishDistance,
    playerSpeed,
    aiSpeed,
    bgOffset,
    boostStatus,
    timeRemaining,
    totalTime,
  };

  useEffect(() => {
    setCarThumbFailed(false);
  }, [selectedCar.id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let tick = 0;

    interface RaceParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      life: number;
      maxLife: number;
      kind: 'flame' | 'spark' | 'smoke' | 'dust' | 'grain';
      tint?: 'cyan' | 'cobalt' | 'crimson' | 'amber';
    }
    const nitroParticles: RaceParticle[] = [];

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const drawCar = (
      x: number,
      y: number,
      isPlayer: boolean,
      speed: number,
      status: PlayerBoostStatus,
      sunsetProgress: number,
      frame: number,
      carId: string
    ) => {
      ctx.save();
      const isNitro = isPlayer && status === 'nitro';

      // Per-car Nitro chassis motion (drift weave, GT3 aero squat, F40 surge, Evo AWD vibration)
      let nitroOffsetX = 0;
      let nitroOffsetY = 0;
      let nitroTilt = 0;
      if (isNitro) {
        if (carId === 'car-gt') {
          nitroOffsetY = Math.sin(frame * 0.28) * 2.4;
          nitroTilt = -0.07 + Math.sin(frame * 0.45) * 0.028;
        } else if (carId === 'car-drift') {
          nitroOffsetX = 4;
          nitroTilt = -0.055;
        } else if (carId === 'car-ferrari') {
          nitroOffsetX = Math.sin(frame * 0.5) * 3.8 + 3;
          nitroTilt = -0.04;
        } else if (carId === 'car-hyper') {
          nitroOffsetX = Math.cos(frame * 1.1) * 1.4;
          nitroOffsetY = Math.sin(frame * 1.2) * 1.8;
          nitroTilt = -0.065;
        }
      }

      ctx.translate(x + nitroOffsetX, y + nitroOffsetY);

      const scale = isPlayer ? 1.26 : 1.04;
      ctx.scale(scale, scale);

      const bounce = speed > 5 ? Math.sin(frame * 0.35) * (status === 'nitro' ? 1.7 : 0.85) : 0;
      ctx.translate(0, bounce);
      if (nitroTilt !== 0) {
        ctx.rotate(nitroTilt);
      }

      // Ground shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
      ctx.beginPath();
      ctx.ellipse(0, 18, 49, 8.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Per-car Nitro underglow / shockwave / anti-lag FX
      if (isNitro) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        if (carId === 'car-gt') {
          // Neon cyan JDM drift underglow
          const ug = ctx.createLinearGradient(-42, 13, 44, 13);
          ug.addColorStop(0, 'rgba(34, 211, 238, 0.8)');
          ug.addColorStop(0.5, 'rgba(56, 189, 248, 0.9)');
          ug.addColorStop(1, 'rgba(34, 211, 238, 0.25)');
          ctx.fillStyle = ug;
          ctx.beginPath();
          ctx.ellipse(0, 15, 44, 5, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (carId === 'car-drift') {
          // Porsche GT3 sonic aerodynamic shockwave rings
          for (let rIdx = 0; rIdx < 3; rIdx++) {
            const wavePhase = (frame * 0.14 + rIdx * 0.33) % 1;
            const ringX = 28 - wavePhase * 88;
            const alpha = (1 - wavePhase) * 0.72;
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.arc(ringX, -4, 18 + wavePhase * 18, Math.PI * 0.65, Math.PI * 1.35);
            ctx.stroke();
          }
        } else if (carId === 'car-ferrari') {
          // Ferrari F40 crimson turbo energy aura + speed streaks
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
          ctx.lineWidth = 2;
          for (let s = 0; s < 3; s++) {
            const sy = -14 + s * 10;
            const sx = -42 - ((frame * 6 + s * 14) % 36);
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx - 26, sy);
            ctx.stroke();
          }
        } else if (carId === 'car-hyper') {
          // Lancer Evo AWD anti-lag ground-shaker backfire ring
          if (frame % 7 < 3) {
            ctx.fillStyle = 'rgba(251, 146, 60, 0.65)';
            ctx.beginPath();
            ctx.arc(-52, 4, 15, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }

      // Drift tire smoke & sparks behind rear wheel
      if (isPlayer && speed > 15) {
        const smokeCount = status === 'nitro' ? 6 : 3;
        for (let sIdx = 0; sIdx < smokeCount; sIdx++) {
          const cycle = (frame * (status === 'nitro' ? 0.32 : 0.16) + sIdx * 1.4) % 5;
          const sx = -32 - cycle * 11;
          const sy = 10 - cycle * 2.4 + Math.sin(frame * 0.4 + sIdx) * 2;
          const sr = 5 + cycle * (status === 'nitro' ? 2.4 : 1.5);
          const alpha = Math.max(0, 0.48 - cycle * 0.09);
          ctx.fillStyle =
            isNitro && carId === 'car-gt'
              ? `rgba(186, 230, 253, ${alpha})`
              : `rgba(203, 213, 225, ${alpha})`;
          ctx.beginPath();
          ctx.arc(sx, sy, sr, 0, Math.PI * 2);
          ctx.fill();

          if (status === 'nitro' && sIdx % 2 === 0) {
            ctx.fillStyle =
              carId === 'car-gt'
                ? 'rgba(34, 211, 238, 0.9)'
                : carId === 'car-drift'
                ? 'rgba(250, 204, 21, 0.85)'
                : 'rgba(249, 115, 22, 0.85)';
            ctx.fillRect(sx - 2, sy + 2, 4, 1.5);
          }
        }
      }

      // Headlight beam as sunset deepens (or extra bright flash during F40 nitro)
      if ((sunsetProgress > 0.25 && speed > 0) || (isNitro && carId === 'car-ferrari')) {
        const beamAlpha = isNitro && carId === 'car-ferrari'
          ? 0.55
          : Math.min(0.45, (sunsetProgress - 0.25) * 0.6);
        const grad = ctx.createLinearGradient(44, 0, 185, 0);
        grad.addColorStop(0, `rgba(254, 240, 138, ${beamAlpha})`);
        grad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(44, -2);
        ctx.lineTo(185, -24);
        ctx.lineTo(185, 22);
        ctx.lineTo(44, 6);
        ctx.closePath();
        ctx.fill();
      }

      // Custom per-car Nitro exhaust flame plume for player
      if (isNitro) {
        const flicker = 22 + Math.sin(frame * 0.9) * 11;
        if (carId === 'car-gt') {
          // Dual cyan-white JDM drift exhaust flames
          [-1, 5].forEach((fy) => {
            const g = ctx.createLinearGradient(-46, fy, -46 - flicker * 2.5, fy);
            g.addColorStop(0, '#ECFEFF');
            g.addColorStop(0.35, '#22D3EE');
            g.addColorStop(0.8, '#0284C7');
            g.addColorStop(1, 'rgba(2, 132, 199, 0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(-45, fy - 3.5);
            ctx.lineTo(-45 - flicker * 2.5, fy);
            ctx.lineTo(-45, fy + 3.5);
            ctx.closePath();
            ctx.fill();
          });
        } else if (carId === 'car-drift') {
          // Focused cobalt & gold center-exit Porsche GT3 plasma jet
          const g = ctx.createLinearGradient(-46, 4, -46 - flicker * 2.8, 4);
          g.addColorStop(0, '#FEF9C3');
          g.addColorStop(0.3, '#38BDF8');
          g.addColorStop(0.75, '#1D4ED8');
          g.addColorStop(1, 'rgba(29, 78, 216, 0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(-45, -1);
          ctx.lineTo(-45 - flicker * 2.8, 4);
          ctx.lineTo(-45, 9);
          ctx.closePath();
          ctx.fill();
        } else if (carId === 'car-ferrari') {
          // Triple-jet red/gold F40 turbo inferno
          [-2, 3, 8].forEach((fy, idx) => {
            const len = flicker * (idx === 1 ? 3.0 : 2.2);
            const g = ctx.createLinearGradient(-46, fy, -46 - len, fy);
            g.addColorStop(0, '#FEF08A');
            g.addColorStop(0.4, '#EF4444');
            g.addColorStop(1, 'rgba(220, 38, 38, 0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(-45, fy - 2.8);
            ctx.lineTo(-45 - len, fy);
            ctx.lineTo(-45, fy + 2.8);
            ctx.closePath();
            ctx.fill();
          });
        } else {
          // Lancer Evo explosive anti-lag fire blast
          const burst = frame % 5 < 2 ? 3.2 : 2.3;
          const g = ctx.createLinearGradient(-46, 3, -46 - flicker * burst, 3);
          g.addColorStop(0, '#FEF08A');
          g.addColorStop(0.35, '#F97316');
          g.addColorStop(0.75, '#EF4444');
          g.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(-44, -4);
          ctx.lineTo(-44 - flicker * burst, 4);
          ctx.lineTo(-44, 11);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Brake red lights when stopped
      if (isPlayer && status === 'stopped') {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
        ctx.beginPath();
        ctx.arc(-46, 1, 14, 0, Math.PI * 2);
        ctx.fill();
      }

      // 1. Toyota Chaser JZX100 Drift Sedan (Pearl White JDM)
      if (carId === 'car-gt') {
        // Sedan silhouette with long hood & crisp trunk deck
        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.moveTo(-46, 10);
        ctx.lineTo(-47, -6);
        ctx.lineTo(-27, -9);
        ctx.lineTo(-14, -22);
        ctx.lineTo(14, -22);
        ctx.lineTo(31, -8);
        ctx.lineTo(48, -5);
        ctx.lineTo(50, 10);
        ctx.closePath();
        ctx.fill();

        // Lower cel-shaded shadow & JDM aero bodykit skirt
        ctx.fillStyle = '#CBD5E1';
        ctx.fillRect(-46, 4, 96, 6);
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(42, 6, 9, 4); // Front lip & intercooler

        // Trunk ducktail lip
        ctx.fillStyle = '#E2E8F0';
        ctx.beginPath();
        ctx.moveTo(-47, -6);
        ctx.lineTo(-49, -11);
        ctx.lineTo(-41, -7);
        ctx.closePath();
        ctx.fill();

        // Dark smoked 4-door greenhouse windows with B-pillar
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.moveTo(-23, -8);
        ctx.lineTo(-12, -19.5);
        ctx.lineTo(13, -19.5);
        ctx.lineTo(27, -8);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#E2E8F0';
        ctx.fillRect(-2, -20, 3, 12); // B-pillar

        // Crisp anime outline
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-46, 10);
        ctx.lineTo(-47, -6);
        ctx.lineTo(-27, -9);
        ctx.lineTo(-14, -22);
        ctx.lineTo(14, -22);
        ctx.lineTo(31, -8);
        ctx.lineTo(48, -5);
        ctx.lineTo(50, 10);
        ctx.closePath();
        ctx.stroke();

        // Quad crystal headlight + amber corner blinker
        ctx.fillStyle = '#FEF08A';
        ctx.fillRect(44, -4, 5, 5);
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(42, 2, 6, 3);
        ctx.fillStyle = status === 'stopped' ? '#EF4444' : '#DC2626';
        ctx.fillRect(-47, -4, 4, 6);
      }
      // 2. Porsche 911 GT3 (Bright Blue Coupe + Active DRS Swan-Neck Wing)
      else if (carId === 'car-drift') {
        // Swan-neck GT3 tall rear wing (tilts forward in DRS Nitro mode)
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(-43, -20, 3, 13);
        ctx.save();
        ctx.translate(-41, -21);
        if (isNitro) {
          ctx.rotate(0.24);
        }
        ctx.fillStyle = isNitro ? '#38BDF8' : '#0284C7';
        ctx.beginPath();
        ctx.moveTo(-10, -3);
        ctx.lineTo(8, 0);
        ctx.lineTo(7, 3);
        ctx.lineTo(-9, 1);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#082F49';
        ctx.lineWidth = 1.1;
        ctx.stroke();
        ctx.restore();

        // Sloping Porsche 911 fastback teardrop silhouette
        ctx.fillStyle = '#0EA5E9';
        ctx.beginPath();
        ctx.moveTo(-45, 10);
        ctx.lineTo(-46, -5);
        ctx.quadraticCurveTo(-32, -11, -18, -21);
        ctx.quadraticCurveTo(-2, -26, 14, -19);
        ctx.quadraticCurveTo(32, -10, 48, -2);
        ctx.lineTo(49, 10);
        ctx.closePath();
        ctx.fill();

        // Deep cobalt lower contour & rear fender flare
        ctx.fillStyle = '#0369A1';
        ctx.beginPath();
        ctx.moveTo(-45, 10);
        ctx.lineTo(-45, 2);
        ctx.lineTo(48, 3);
        ctx.lineTo(49, 10);
        ctx.closePath();
        ctx.fill();

        // Teardrop side glass
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.moveTo(-21, -8);
        ctx.quadraticCurveTo(-8, -21, 9, -18);
        ctx.lineTo(24, -8);
        ctx.closePath();
        ctx.fill();

        // Glass sheen
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.beginPath();
        ctx.moveTo(-9, -16);
        ctx.lineTo(4, -16);
        ctx.lineTo(9, -9);
        ctx.lineTo(-12, -9);
        ctx.closePath();
        ctx.fill();

        // Crisp body outline
        ctx.strokeStyle = '#082F49';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-45, 10);
        ctx.lineTo(-46, -5);
        ctx.quadraticCurveTo(-32, -11, -18, -21);
        ctx.quadraticCurveTo(-2, -26, 14, -19);
        ctx.quadraticCurveTo(32, -10, 48, -2);
        ctx.lineTo(49, 10);
        ctx.closePath();
        ctx.stroke();

        // Porsche oval headlight & sleek LED rear lightbar
        ctx.fillStyle = '#FEF9C3';
        ctx.beginPath();
        ctx.ellipse(42, -3, 5, 3, -0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(-47, -4, 6, 3);
      }
      // 3. Ferrari F40 Liberty Walk (Pearl White Wedge Supercar + Red Circle Decal + Tall Box Wing)
      else if (carId === 'car-ferrari') {
        // Integrated tall F40 box rear wing
        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.moveTo(-47, -5);
        ctx.lineTo(-49, -23);
        ctx.lineTo(-34, -23);
        ctx.lineTo(-36, -18);
        ctx.lineTo(-43, -18);
        ctx.lineTo(-42, -6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Sharp 80s wedge supercar silhouette
        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.moveTo(-46, 10);
        ctx.lineTo(-47, -6);
        ctx.lineTo(-20, -8);
        ctx.lineTo(-6, -21);
        ctx.lineTo(13, -21);
        ctx.lineTo(32, -9);
        ctx.lineTo(50, -1);
        ctx.lineTo(50, 10);
        ctx.closePath();
        ctx.fill();

        // Matte black LBWK front splitter & side skirt
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(-45, 6, 97, 4);

        // Signature red circle decal on door (just like the uploaded image!)
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.arc(-2, 0, 5.5, 0, Math.PI * 2);
        ctx.fill();

        // Side NACA air intake duct
        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        ctx.moveTo(-19, -4);
        ctx.lineTo(-9, -6);
        ctx.lineTo(-9, 1);
        ctx.closePath();
        ctx.fill();

        // Steep supercar cockpit glass
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.moveTo(-14, -7);
        ctx.lineTo(-4, -18.5);
        ctx.lineTo(12, -18.5);
        ctx.lineTo(27, -7);
        ctx.closePath();
        ctx.fill();

        // Crisp body outline
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-46, 10);
        ctx.lineTo(-47, -6);
        ctx.lineTo(-20, -8);
        ctx.lineTo(-6, -21);
        ctx.lineTo(13, -21);
        ctx.lineTo(32, -9);
        ctx.lineTo(50, -1);
        ctx.lineTo(50, 10);
        ctx.closePath();
        ctx.stroke();

        // Glowing red twin-turbo engine bay & pop-up headlights during F40 Nitro
        if (isNitro) {
          ctx.fillStyle = frame % 4 < 2 ? '#EF4444' : '#FCA5A5';
          ctx.fillRect(-35, -7, 13, 3);
          // Pop-up headlight pod raised
          ctx.fillStyle = '#F8FAFC';
          ctx.beginPath();
          ctx.moveTo(35, -7);
          ctx.lineTo(42, -11);
          ctx.lineTo(45, -5);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(42, -10, 4, 4);
        }

        // Twin clear-cover F40 headlights & round taillight
        ctx.fillStyle = '#FEF08A';
        ctx.fillRect(42, -3, 7, 4);
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.arc(-45, -1, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      // 4. Mitsubishi Lancer Evolution Merah (Crimson JDM Rally Sedan + Hood Vents + Tall Evo Wing)
      else if (carId === 'car-hyper') {
        // Tall Evo boxy rally wing
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(-45, -21, 3, 14);
        ctx.fillStyle = '#DC2626';
        ctx.fillRect(-49, -23, 14, 4);
        ctx.strokeStyle = '#450A0A';
        ctx.lineWidth = 1.1;
        ctx.strokeRect(-49, -23, 14, 4);

        // Aggressive rally sedan silhouette
        ctx.fillStyle = '#DC2626';
        ctx.beginPath();
        ctx.moveTo(-45, 10);
        ctx.lineTo(-46, -6);
        ctx.lineTo(-26, -9);
        ctx.lineTo(-12, -22);
        ctx.lineTo(15, -22);
        ctx.lineTo(32, -8);
        ctx.lineTo(48, -3);
        ctx.lineTo(49, 10);
        ctx.closePath();
        ctx.fill();

        // Dark crimson lower shading & black Evo splitter
        ctx.fillStyle = '#991B1B';
        ctx.fillRect(-45, 3, 94, 4);
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(-45, 7, 96, 3);

        // Hood turbo vents (erupting amber flame bursts during Lancer Evo Nitro)
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(28, -9, 7, 2);
        ctx.fillRect(37, -7, 5, 2);
        if (isNitro && frame % 5 < 3) {
          ctx.fillStyle = '#FACC15';
          ctx.beginPath();
          ctx.moveTo(29, -9);
          ctx.lineTo(18, -14);
          ctx.lineTo(33, -9);
          ctx.closePath();
          ctx.fill();
        }

        // Smoked rally cabin glass
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.moveTo(-22, -8);
        ctx.lineTo(-10, -19.5);
        ctx.lineTo(14, -19.5);
        ctx.lineTo(27, -8);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#991B1B';
        ctx.fillRect(-1, -20, 2.5, 12); // B-pillar

        // Crisp body outline
        ctx.strokeStyle = '#450A0A';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-45, 10);
        ctx.lineTo(-46, -6);
        ctx.lineTo(-26, -9);
        ctx.lineTo(-12, -22);
        ctx.lineTo(15, -22);
        ctx.lineTo(32, -8);
        ctx.lineTo(48, -3);
        ctx.lineTo(49, 10);
        ctx.closePath();
        ctx.stroke();

        // Sharp Evo headlights & taillight
        ctx.fillStyle = '#FEF08A';
        ctx.fillRect(43, -2, 6, 4);
        ctx.fillStyle = '#F87171';
        ctx.fillRect(-47, -4, 4, 5);
      }
      // 5. AI Opponent Car (Sleek Dark Slate Coupe)
      else {
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.moveTo(-42, 10);
        ctx.lineTo(-44, -4);
        ctx.lineTo(-26, -8);
        ctx.lineTo(-10, -21);
        ctx.lineTo(18, -21);
        ctx.lineTo(35, -7);
        ctx.lineTo(46, -2);
        ctx.lineTo(46, 10);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(-40, 1, 82, 3.5);

        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.moveTo(-20, -7);
        ctx.lineTo(-8, -17);
        ctx.lineTo(15, -17);
        ctx.lineTo(28, -7);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(-45, -13, 8, 3);
        ctx.fillRect(-41, -10, 3, 6);

        ctx.fillStyle = '#FEF08A';
        ctx.fillRect(42, -3, 5, 5);
        ctx.fillStyle = '#DC2626';
        ctx.fillRect(-45, -3, 4, 6);
      }

      // Wheels customized per car model
      const wheelRot = (frame * speed * 0.008) % (Math.PI * 2);
      const rimColor =
        carId === 'car-ferrari'
          ? '#1E293B'
          : carId === 'car-drift'
          ? '#94A3B8'
          : carId === 'car-hyper'
          ? '#FACC15'
          : '#CBD5E1';

      [-26, 27].forEach((wx) => {
        ctx.save();
        ctx.translate(wx, 11);
        ctx.fillStyle = '#090D16';
        ctx.beginPath();
        ctx.arc(0, 0, 10.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = rimColor;
        ctx.beginPath();
        ctx.arc(0, 0, 5.8, 0, Math.PI * 2);
        ctx.fill();

        // Brake caliper accent on GT3 / Evo
        if (carId === 'car-drift' || carId === 'car-hyper') {
          ctx.fillStyle = carId === 'car-drift' ? '#FACC15' : '#EF4444';
          ctx.fillRect(-4.5, -2, 2.5, 4);
        }

        ctx.rotate(wheelRot);
        ctx.strokeStyle = carId === 'car-ferrari' ? '#94A3B8' : '#1E293B';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-4.8, 0);
        ctx.lineTo(4.8, 0);
        ctx.moveTo(0, -4.8);
        ctx.lineTo(0, 4.8);
        ctx.stroke();
        ctx.restore();
      });

      // Label tag above vehicle
      ctx.font = '600 10.5px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = isPlayer ? '#FDE68A' : '#CBD5E1';
      ctx.fillText(isPlayer ? 'ANDA' : 'AI SENJA', 0, -31);

      ctx.restore();
    };

    const drawCamel = (
      x: number,
      y: number,
      isPlayer: boolean,
      speed: number,
      status: PlayerBoostStatus,
      frame: number
    ) => {
      ctx.save();
      ctx.translate(x, y);

      const isMoving = speed > 2;
      const gallop = isMoving ? Math.sin(frame * (status === 'nitro' ? 0.52 : 0.3)) : 0;
      const bounce = isMoving ? Math.abs(gallop) * -4 : 2;
      ctx.translate(0, bounce);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
      ctx.beginPath();
      ctx.ellipse(0, 20 - bounce, 36, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      if (isPlayer && status === 'nitro') {
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.75)';
        ctx.lineWidth = 2.5;
        for (let i = 0; i < 3; i++) {
          const offset = (frame * 5 + i * 18) % 45;
          ctx.beginPath();
          ctx.moveTo(-34 - offset, -14 + i * 10);
          ctx.lineTo(-64 - offset, -14 + i * 10);
          ctx.stroke();
        }
      }

      const coatColor = isPlayer ? '#D97706' : '#A16207';
      const coatDark = isPlayer ? '#B45309' : '#78350F';
      const saddleColor = isPlayer ? '#059669' : '#334155';

      ctx.strokeStyle = coatDark;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';

      const legSwingA = isMoving ? gallop * 11 : 0;
      const legSwingB = isMoving ? -gallop * 11 : 0;

      ctx.beginPath();
      ctx.moveTo(-18, 2);
      ctx.lineTo(-20 + legSwingB, 19);
      ctx.moveTo(15, 2);
      ctx.lineTo(17 + legSwingA, 19);
      ctx.stroke();

      ctx.fillStyle = coatColor;
      ctx.beginPath();
      ctx.moveTo(-26, 4);
      ctx.quadraticCurveTo(-28, -10, -14, -13);
      ctx.quadraticCurveTo(-2, -30, 8, -13);
      ctx.quadraticCurveTo(22, -12, 24, 0);
      ctx.quadraticCurveTo(22, 10, 0, 9);
      ctx.quadraticCurveTo(-22, 10, -26, 4);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = coatColor;
      ctx.lineWidth = 8.5;
      ctx.beginPath();
      ctx.moveTo(19, -2);
      ctx.quadraticCurveTo(29, -12, 32, -26);
      ctx.stroke();

      ctx.fillStyle = coatColor;
      ctx.beginPath();
      ctx.ellipse(37, -27, 9, 5.5, 0.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(38, -28.5, 1.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = saddleColor;
      ctx.beginPath();
      ctx.moveTo(-14, -13);
      ctx.quadraticCurveTo(-2, -25, 9, -13);
      ctx.lineTo(11, -3);
      ctx.lineTo(-15, -3);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#FBBF24';
      ctx.fillRect(-13, -7, 22, 3);

      ctx.strokeStyle = coatColor;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-14, 4);
      ctx.lineTo(-15 + legSwingA, 20);
      ctx.moveTo(18, 4);
      ctx.lineTo(20 + legSwingB, 20);
      ctx.stroke();

      ctx.strokeStyle = coatDark;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-26, -2);
      ctx.quadraticCurveTo(-34, 2, -32 + gallop * 3, 10);
      ctx.stroke();

      ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = isPlayer ? '#FDE68A' : '#CBD5E1';
      ctx.fillText(isPlayer ? 'ANDA' : 'AI SENJA', 2, -41);

      ctx.restore();
    };

    const render = () => {
      tick += 1;
      const st = stateRef.current;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      const sunsetProgress = Math.max(0, Math.min(1, 1 - st.timeRemaining / Math.max(1, st.totalTime)));

      const skyTop = lerpColor([30, 41, 78], [10, 12, 30], sunsetProgress);
      const skyMid = lerpColor([217, 119, 6], [76, 29, 149], Math.pow(sunsetProgress, 0.85));
      const skyBot = lerpColor([253, 186, 116], [194, 65, 12], sunsetProgress);

      const horizonY = h * 0.56;
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, skyTop);
      skyGrad.addColorStop(0.62, skyMid);
      skyGrad.addColorStop(1, skyBot);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, horizonY + 4);

      const starAlpha = Math.max(0.08, sunsetProgress * 0.9);
      ctx.fillStyle = `rgba(255, 255, 255, ${starAlpha})`;
      for (let i = 0; i < 28; i++) {
        const sx = ((i * 137.5 + 40) % w);
        const sy = ((i * 53.3 + 18) % (horizonY * 0.68));
        const r = i % 4 === 0 ? 1.6 : 1;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      const moonX = w * 0.84;
      const moonY = h * 0.14;
      ctx.save();
      ctx.globalAlpha = 0.35 + sunsetProgress * 0.65;
      ctx.fillStyle = '#FDE68A';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = skyTop;
      ctx.beginPath();
      ctx.arc(moonX + 7, moonY - 4, 15.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const sunX = w * 0.52;
      const sunStartY = horizonY * 0.34;
      const sunEndY = horizonY + 34;
      const sunY = lerp(sunStartY, sunEndY, sunsetProgress);
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 12, sunX, sunY, 95);
      sunGlow.addColorStop(0, 'rgba(254, 243, 199, 0.95)');
      sunGlow.addColorStop(0.35, 'rgba(251, 146, 60, 0.55)');
      sunGlow.addColorStop(1, 'rgba(251, 146, 60, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 95, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = lerpColor([254, 240, 138], [239, 68, 68], sunsetProgress * 0.85);
      ctx.beginPath();
      ctx.arc(sunX, sunY, 30, 0, Math.PI * 2);
      ctx.fill();

      const farOffset = (st.bgOffset * 0.14) % 420;
      ctx.fillStyle = lerpColor([120, 53, 15], [30, 27, 75], sunsetProgress * 0.75);
      ctx.beginPath();
      ctx.moveTo(0, horizonY + 10);
      for (let x = -420; x <= w + 420; x += 210) {
        const px = x - farOffset;
        ctx.quadraticCurveTo(px + 105, horizonY - 38, px + 210, horizonY - 4);
      }
      ctx.lineTo(w, horizonY + 25);
      ctx.lineTo(0, horizonY + 25);
      ctx.closePath();
      ctx.fill();

      const mosqueSpacing = 720;
      const mosqueShift = (st.bgOffset * 0.18) % mosqueSpacing;
      ctx.fillStyle = lerpColor([69, 26, 3], [15, 23, 42], sunsetProgress * 0.8);
      for (let mx = -mosqueSpacing; mx < w + mosqueSpacing; mx += mosqueSpacing) {
        const bx = mx - mosqueShift + 260;
        const by = horizonY - 6;
        ctx.beginPath();
        ctx.arc(bx, by - 14, 18, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(bx - 22, by - 14, 44, 18);
        ctx.fillRect(bx + 26, by - 38, 7, 42);
        ctx.beginPath();
        ctx.arc(bx + 29.5, by - 38, 4.5, Math.PI, 0);
        ctx.fill();
        if (sunsetProgress > 0.35) {
          ctx.fillStyle = '#FBBF24';
          ctx.fillRect(bx - 8, by - 9, 4, 7);
          ctx.fillRect(bx + 4, by - 9, 4, 7);
          ctx.fillStyle = lerpColor([69, 26, 3], [15, 23, 42], sunsetProgress * 0.8);
        }
      }

      const midOffset = (st.bgOffset * 0.42) % 360;
      ctx.fillStyle = lerpColor([180, 83, 9], [51, 25, 28], sunsetProgress * 0.7);
      ctx.beginPath();
      ctx.moveTo(0, horizonY + 40);
      for (let x = -360; x <= w + 360; x += 180) {
        const px = x - midOffset;
        ctx.quadraticCurveTo(px + 90, horizonY - 14, px + 180, horizonY + 14);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      const palmSpacing = 320;
      const palmShift = (st.bgOffset * 0.55) % palmSpacing;
      for (let px = -palmSpacing; px < w + palmSpacing; px += palmSpacing) {
        const x = px - palmShift + 120;
        const y = horizonY + 12;
        ctx.strokeStyle = '#1E1B18';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + 4, y - 24, x + 8, y - 42);
        ctx.stroke();

        ctx.fillStyle = '#14281D';
        for (let a = 0; a < 5; a++) {
          const ang = -Math.PI + (a * Math.PI) / 4;
          ctx.beginPath();
          ctx.ellipse(x + 8 + Math.cos(ang) * 10, y - 42 + Math.sin(ang) * 5, 11, 3, ang, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const roadTop = horizonY + 22;
      const roadHeight = h - roadTop;

      ctx.fillStyle = lerpColor([146, 64, 14], [41, 37, 36], sunsetProgress * 0.6);
      ctx.fillRect(0, roadTop - 10, w, 12);

      const roadGrad = ctx.createLinearGradient(0, roadTop, 0, h);
      roadGrad.addColorStop(0, '#1E293B');
      roadGrad.addColorStop(1, '#0F172A');
      ctx.fillStyle = roadGrad;
      ctx.fillRect(0, roadTop, w, roadHeight);

      ctx.fillStyle = 'rgba(245, 158, 11, 0.55)';
      ctx.fillRect(0, roadTop, w, 3);
      ctx.fillRect(0, h - 6, w, 3);

      const dashPeriod = 76;
      const dashShift = st.bgOffset % dashPeriod;
      const laneDividerY = roadTop + roadHeight * 0.48;
      ctx.fillStyle = 'rgba(248, 250, 252, 0.55)';
      for (let dx = -dashPeriod; dx < w + dashPeriod; dx += dashPeriod) {
        ctx.fillRect(dx - dashShift, laneDividerY - 2, 42, 4);
      }

      const lanternSpacing = 220;
      const lanternShift = st.bgOffset % lanternSpacing;
      for (let lx = -lanternSpacing; lx < w + lanternSpacing; lx += lanternSpacing) {
        const x = lx - lanternShift + 60;
        const y = roadTop - 4;
        ctx.fillStyle = '#475569';
        ctx.fillRect(x - 1.5, y - 22, 3, 22);
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(x, y - 24, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
        ctx.beginPath();
        ctx.arc(x, y - 24, 13, 0, Math.PI * 2);
        ctx.fill();
      }

      const playerScreenX = Math.max(105, w * 0.22);
      const pixelsPerMeter = 6.2;
      const finishScreenX = playerScreenX + (st.finishDistance - st.playerDistance) * pixelsPerMeter;

      if (finishScreenX > -120 && finishScreenX < w + 120) {
        const cols = 2;
        const rows = Math.ceil(roadHeight / 14);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            ctx.fillStyle = (r + c) % 2 === 0 ? '#F8FAFC' : '#0F172A';
            ctx.fillRect(finishScreenX + c * 12, roadTop + r * 14, 12, 14);
          }
        }
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(finishScreenX - 4, roadTop - 52, 8, 52);
        ctx.fillRect(finishScreenX + 20, roadTop - 52, 8, 52);
        ctx.fillStyle = '#065F46';
        ctx.fillRect(finishScreenX - 42, roadTop - 74, 112, 24);
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 2;
        ctx.strokeRect(finishScreenX - 42, roadTop - 74, 112, 24);
        ctx.fillStyle = '#FEF3C7';
        ctx.font = '700 11px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PENAMAT', finishScreenX + 14, roadTop - 58);
      }

      if (st.boostStatus === 'nitro') {
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.38)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
          const ly = roadTop + 14 + ((i * 29) % (roadHeight - 24));
          const lx = ((w - ((tick * 28 + i * 190) % (w + 200))) + w) % w;
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(lx + 48, ly);
          ctx.stroke();
        }
      }

      const aiLaneY = roadTop + roadHeight * 0.25;
      const playerLaneY = roadTop + roadHeight * 0.74;

      const aiScreenX = playerScreenX + (st.aiDistance - st.playerDistance) * pixelsPerMeter;
      const aiVehicle: VehicleType = st.playerVehicle === 'car' ? 'car' : 'camel';

      if (aiScreenX >= -70 && aiScreenX <= w + 70) {
        if (aiVehicle === 'car') {
          drawCar(aiScreenX, aiLaneY, false, st.aiSpeed, 'normal', sunsetProgress, tick, 'ai');
        } else {
          drawCamel(aiScreenX, aiLaneY, false, st.aiSpeed, 'normal', tick);
        }
      } else {
        const isAhead = aiScreenX > w + 70;
        const deltaMeters = Math.round(Math.abs(st.aiDistance - st.playerDistance));
        const badgeX = isAhead ? w - 92 : 14;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(badgeX, aiLaneY - 14, 78, 24);
        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 1;
        ctx.strokeRect(badgeX, aiLaneY - 14, 78, 24);
        ctx.fillStyle = '#E2E8F0';
        ctx.font = '600 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(isAhead ? `AI +${deltaMeters}m →` : `← AI -${deltaMeters}m`, badgeX + 39, aiLaneY + 2);
      }

      // Desert Dust & Sand Grain Particle System + Per-Car Nitro Trail behind vehicles
      const emitX = st.playerVehicle === 'car' ? playerScreenX - 58 : playerScreenX - 28;
      const emitY = st.playerVehicle === 'car' ? playerLaneY + 3 : playerLaneY + 5;
      const dustY = st.playerVehicle === 'car' ? playerLaneY + 14 : playerLaneY + 19;

      // High-speed desert dust & sand grains behind player vehicle
      if (st.playerSpeed >= 30) {
        const isHighSpeed = st.boostStatus === 'nitro' || st.playerSpeed >= 75;
        const dustCount = isHighSpeed ? 3 : tick % 2 === 0 ? 1 : 0;
        for (let d = 0; d < dustCount; d++) {
          const maxLife = isHighSpeed ? 28 + Math.random() * 14 : 20 + Math.random() * 10;
          nitroParticles.push({
            x: emitX + (Math.random() - 0.5) * 14,
            y: dustY + (Math.random() - 0.5) * 6,
            vx: -(st.playerSpeed * 0.065) - Math.random() * 2.4,
            vy: -0.35 - Math.random() * 1.15,
            radius: isHighSpeed ? 7 + Math.random() * 7 : 4.5 + Math.random() * 4,
            life: maxLife,
            maxLife,
            kind: 'dust',
          });
        }
        const grainCount = isHighSpeed ? 4 : 1;
        for (let g = 0; g < grainCount; g++) {
          const maxLife = 16 + Math.random() * 12;
          nitroParticles.push({
            x: emitX + 6 + (Math.random() - 0.5) * 10,
            y: dustY + 2 + (Math.random() - 0.5) * 4,
            vx: -(st.playerSpeed * 0.09) - Math.random() * 4.5,
            vy: -1.1 - Math.random() * 2.1,
            radius: 1.3 + Math.random() * 1.5,
            life: maxLife,
            maxLife,
            kind: 'grain',
          });
        }
      }

      // Desert dust behind AI vehicle when visible and moving at high speed
      if (aiScreenX >= -50 && aiScreenX <= w + 50 && st.aiSpeed >= 45 && tick % 2 === 0) {
        const aiEmitX = aiVehicle === 'car' ? aiScreenX - 46 : aiScreenX - 24;
        const aiDustY = aiVehicle === 'car' ? aiLaneY + 12 : aiLaneY + 18;
        const maxLife = 20 + Math.random() * 8;
        nitroParticles.push({
          x: aiEmitX + (Math.random() - 0.5) * 10,
          y: aiDustY + (Math.random() - 0.5) * 4,
          vx: -(st.aiSpeed * 0.055) - Math.random() * 1.8,
          vy: -0.3 - Math.random() * 0.8,
          radius: 5 + Math.random() * 4.5,
          life: maxLife,
          maxLife,
          kind: 'dust',
        });
      }

      const activeTint: RaceParticle['tint'] =
        st.playerVehicle === 'camel'
          ? 'amber'
          : st.selectedCar.id === 'car-gt'
          ? 'cyan'
          : st.selectedCar.id === 'car-drift'
          ? 'cobalt'
          : st.selectedCar.id === 'car-ferrari'
          ? 'crimson'
          : 'amber';

      if (st.boostStatus === 'nitro') {
        // Blazing fire trail ribbon directly behind exhaust/rear (color-matched per car)
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const trailLen = 95 + Math.sin(tick * 0.75) * 22;
        const ribbonGrad = ctx.createLinearGradient(emitX, emitY, emitX - trailLen, emitY);
        if (activeTint === 'cyan') {
          ribbonGrad.addColorStop(0, 'rgba(236, 254, 255, 0.94)');
          ribbonGrad.addColorStop(0.32, 'rgba(34, 211, 238, 0.78)');
          ribbonGrad.addColorStop(0.72, 'rgba(14, 165, 233, 0.38)');
          ribbonGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');
        } else if (activeTint === 'cobalt') {
          ribbonGrad.addColorStop(0, 'rgba(254, 249, 195, 0.94)');
          ribbonGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.8)');
          ribbonGrad.addColorStop(0.7, 'rgba(29, 78, 216, 0.42)');
          ribbonGrad.addColorStop(1, 'rgba(29, 78, 216, 0)');
        } else if (activeTint === 'crimson') {
          ribbonGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
          ribbonGrad.addColorStop(0.28, 'rgba(239, 68, 68, 0.82)');
          ribbonGrad.addColorStop(0.7, 'rgba(185, 28, 28, 0.42)');
          ribbonGrad.addColorStop(1, 'rgba(185, 28, 28, 0)');
        } else {
          ribbonGrad.addColorStop(0, 'rgba(254, 249, 195, 0.92)');
          ribbonGrad.addColorStop(0.28, 'rgba(251, 146, 60, 0.75)');
          ribbonGrad.addColorStop(0.68, 'rgba(239, 68, 68, 0.38)');
          ribbonGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        }
        ctx.fillStyle = ribbonGrad;
        ctx.beginPath();
        ctx.moveTo(emitX + 4, emitY - 8);
        ctx.quadraticCurveTo(emitX - trailLen * 0.45, emitY - 14 + Math.sin(tick * 0.5) * 4, emitX - trailLen, emitY);
        ctx.quadraticCurveTo(emitX - trailLen * 0.45, emitY + 14 + Math.cos(tick * 0.5) * 4, emitX + 4, emitY + 8);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Spawn flame particles
        for (let i = 0; i < 5; i++) {
          const maxLife = 16 + Math.random() * 14;
          nitroParticles.push({
            x: emitX + (Math.random() - 0.5) * 6,
            y: emitY + (Math.random() - 0.5) * 9,
            vx: -5.5 - Math.random() * 5.5,
            vy: (Math.random() - 0.5) * 1.6,
            radius: 5 + Math.random() * 7,
            life: maxLife,
            maxLife,
            kind: 'flame',
            tint: activeTint,
          });
        }
        // Spawn glowing ember sparks
        for (let i = 0; i < 3; i++) {
          const maxLife = 18 + Math.random() * 16;
          nitroParticles.push({
            x: emitX,
            y: emitY + (Math.random() - 0.5) * 10,
            vx: -7.5 - Math.random() * 7.5,
            vy: (Math.random() - 0.5) * 2.8,
            radius: 1.6 + Math.random() * 1.8,
            life: maxLife,
            maxLife,
            kind: 'spark',
            tint: activeTint,
          });
        }
        // Spawn trailing heat-smoke puff
        if (tick % 2 === 0) {
          const maxLife = 26 + Math.random() * 12;
          nitroParticles.push({
            x: emitX - 10,
            y: emitY + (Math.random() - 0.5) * 6,
            vx: -3.2 - Math.random() * 2.2,
            vy: -0.4 - Math.random() * 0.9,
            radius: 6 + Math.random() * 5,
            life: maxLife,
            maxLife,
            kind: 'smoke',
          });
        }
      }

      // Cap particle array to keep frame rate silky smooth
      if (nitroParticles.length > 260) {
        nitroParticles.splice(0, nitroParticles.length - 260);
      }

      // Update & draw active particles
      for (let i = nitroParticles.length - 1; i >= 0; i--) {
        const p = nitroParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;

        if (p.kind === 'flame') {
          p.vy -= 0.03;
          p.radius *= 0.96;
        } else if (p.kind === 'smoke') {
          p.vy -= 0.04;
          p.radius += 0.25;
        } else if (p.kind === 'dust') {
          p.vx *= 0.97;
          p.vy -= 0.025;
          p.radius += 0.32;
        } else if (p.kind === 'grain') {
          p.vy += 0.12;
        } else {
          p.vy += 0.04;
        }

        if (p.life <= 0) {
          nitroParticles.splice(i, 1);
          continue;
        }

        const t = p.life / p.maxLife;
        if (p.kind === 'dust') {
          ctx.fillStyle =
            t > 0.5
              ? `rgba(226, 179, 118, ${t * 0.42})`
              : `rgba(194, 140, 82, ${t * 0.36})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.kind === 'grain') {
          ctx.fillStyle = `rgba(253, 224, 155, ${t * 0.85})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.kind === 'smoke') {
          ctx.fillStyle = `rgba(148, 163, 184, ${t * 0.28})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.kind === 'flame') {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          if (p.tint === 'cyan') {
            ctx.fillStyle =
              t > 0.68
                ? `rgba(236, 254, 255, ${t * 0.88})`
                : t > 0.35
                ? `rgba(34, 211, 238, ${t * 0.82})`
                : `rgba(14, 165, 233, ${t * 0.72})`;
          } else if (p.tint === 'cobalt') {
            ctx.fillStyle =
              t > 0.68
                ? `rgba(254, 249, 195, ${t * 0.88})`
                : t > 0.35
                ? `rgba(56, 189, 248, ${t * 0.82})`
                : `rgba(29, 78, 216, ${t * 0.75})`;
          } else if (p.tint === 'crimson') {
            ctx.fillStyle =
              t > 0.68
                ? `rgba(254, 240, 138, ${t * 0.88})`
                : t > 0.35
                ? `rgba(239, 68, 68, ${t * 0.85})`
                : `rgba(153, 27, 27, ${t * 0.75})`;
          } else {
            ctx.fillStyle =
              t > 0.68
                ? `rgba(254, 249, 195, ${t * 0.85})`
                : t > 0.35
                ? `rgba(249, 115, 22, ${t * 0.82})`
                : `rgba(220, 38, 38, ${t * 0.72})`;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.strokeStyle =
            p.tint === 'cyan'
              ? `rgba(103, 232, 249, ${t * 0.95})`
              : p.tint === 'cobalt'
              ? `rgba(250, 204, 21, ${t * 0.95})`
              : t > 0.5
              ? `rgba(253, 224, 71, ${t * 0.95})`
              : `rgba(249, 115, 22, ${t * 0.9})`;
          ctx.lineWidth = p.radius;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 1.5, p.y - p.vy * 1.5);
          ctx.stroke();
          ctx.restore();
        }
      }

      if (st.playerVehicle === 'car') {
        drawCar(
          playerScreenX,
          playerLaneY,
          true,
          st.playerSpeed,
          st.boostStatus,
          sunsetProgress,
          tick,
          st.selectedCar.id
        );
      } else {
        drawCamel(playerScreenX, playerLaneY, true, st.playerSpeed, st.boostStatus, tick);
      }

      // Live Coding Variables Overlay (speed & bgOffset)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
      ctx.fillRect(14, 12, 238, 28);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = 1;
      ctx.strokeRect(14, 12, 238, 28);
      ctx.fillStyle = '#FDE68A';
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(
        `speed: ${Math.round(st.playerSpeed)} km/j · bgX: ${Math.round(st.bgOffset)}px`,
        24,
        30
      );

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="relative w-full flex-1 min-h-[165px] rounded-xl overflow-hidden border border-slate-700/70 bg-[#0F172A]">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        aria-label="Litar perlumbaan padang pasir Ramadan sebelum matahari terbenam"
      />

      {/* Selected Car Thumbnail Badge (Top-Left below speed/bgX) */}
      {playerVehicle === 'car' && (
        <div className="absolute top-12 left-3.5 flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-950/80 backdrop-blur-sm p-1.5 pr-3 pointer-events-none">
          <div className="w-11 h-7 rounded overflow-hidden bg-slate-900 shrink-0">
            {!carThumbFailed ? (
              <img
                src={selectedCar.imageUrl}
                alt={selectedCar.name}
                referrerPolicy="no-referrer"
                onError={() => setCarThumbFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-800" />
            )}
          </div>
          <span className="text-[11px] font-semibold text-slate-100 whitespace-nowrap">
            {selectedCar.name}
          </span>
        </div>
      )}

      {/* Active Nitro Image Overlay whenever vehicle has nitro power */}
      {boostStatus === 'nitro' && (
        <div
          className="absolute top-3 right-3.5 w-48 sm:w-64 rounded-xl overflow-hidden border-2 border-amber-400 bg-slate-950/90 shadow-lg pointer-events-none transition-opacity duration-150"
          role="status"
          aria-live="polite"
        >
          {playerVehicle === 'car' ? (
            <div className="relative h-22 sm:h-28 w-full bg-gradient-to-r from-amber-600 via-orange-600 to-red-600">
              {!nitroImgFailed ? (
                <img
                  src={NITRO_BOOST_IMAGE_PATH}
                  alt={`Kuasa nitro aktif untuk ${selectedCar.name}`}
                  referrerPolicy="no-referrer"
                  onError={() => setNitroImgFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-amber-200" aria-hidden="true" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-1.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300">
                  <Zap className="w-3.5 h-3.5 fill-amber-300" aria-hidden="true" />
                  <span>NITRO · {selectedCar.name}</span>
                </span>
                <span className="font-mono-num text-[11px] font-bold text-white shrink-0">
                  {Math.round(playerSpeed)} km/j
                </span>
              </div>
            </div>
          ) : (
            <div className="px-3.5 py-2.5 flex items-center justify-between gap-2 bg-gradient-to-r from-amber-900/90 to-slate-950/95">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Zap className="w-4 h-4 fill-amber-300" aria-hidden="true" />
                <span>PECUTAN UNTA AKTIF!</span>
              </span>
              <span className="font-mono-num text-xs font-bold text-white">
                {Math.round(playerSpeed)} km/j
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
