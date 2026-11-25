import React, { useState } from 'react';
import { Car, Compass, Play, Sun, Zap, AlertTriangle, Check } from 'lucide-react';
import { CAR_OPTIONS } from '../data/vehicles';
import { Difficulty, VehicleType } from '../types/game';

interface TitleMenuProps {
  playerName: string;
  onChangeName: (name: string) => void;
  vehicle: VehicleType;
  selectedCarId: string;
  onSelectCar: (carId: string) => void;
  onSelectCamel: () => void;
  difficulty: Difficulty;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onStartRace: () => void;
}

const HERO_IMAGE_PATH = './src/assets/images/ramadan_desert_hero_1795543663301.jpg';

const DIFFICULTIES: { id: Difficulty; label: string; desc: string }[] = [
  { id: 'easy', label: 'Santai', desc: 'AI 52 km/j' },
  { id: 'medium', label: 'Sederhana', desc: 'AI 62 km/j' },
  { id: 'hard', label: 'Pantas', desc: 'AI 72 km/j' },
];

export const TitleMenu: React.FC<TitleMenuProps> = ({
  playerName,
  onChangeName,
  vehicle,
  selectedCarId,
  onSelectCar,
  onSelectCamel,
  difficulty,
  onSelectDifficulty,
  onStartRace,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [carImgErrors, setCarImgErrors] = useState<Record<string, boolean>>({});

  return (
    <div className="h-full flex flex-col justify-between gap-2.5">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-stretch flex-1 min-h-0">
        {/* Left Column: Compact Hero Visual & Rules (hidden on very small phones to keep 500px no-scroll) */}
        <div className="hidden md:flex md:col-span-5 flex-col justify-between rounded-xl overflow-hidden border border-slate-800 bg-slate-900/80">
          <div className="relative flex-1 min-h-[160px] w-full overflow-hidden bg-gradient-to-br from-amber-900 via-orange-950 to-slate-950">
            {!imgFailed ? (
              <img
                src={HERO_IMAGE_PATH}
                alt="Lebuh raya padang pasir pada waktu senja Ramadan menjelang matahari terbenam"
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                <Sun className="w-10 h-10 text-amber-400 mb-2" aria-hidden="true" />
                <p className="font-display text-sm font-semibold text-amber-100">
                  Litar Padang Pasir Senja Ramadan
                </p>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-[11px] font-medium text-amber-300 mb-1">
                Pendidikan Islam · Kuiz Perlumbaan
              </p>
              <h1 className="font-display text-xl lg:text-2xl font-bold text-white tracking-tight text-balance leading-snug">
                Tiba di penamat sebelum matahari terbenam.
              </h1>
            </div>
          </div>

          {/* Compact 3-line rules inside left panel so total height stays <= 500px */}
          <div className="p-3.5 space-y-2 border-t border-slate-800 bg-slate-950/70 text-xs">
            <div className="flex items-center gap-2 text-slate-200">
              <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>Jawapan betul mengaktifkan pecutan Nitro &amp; jejak api.</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" aria-hidden="true" />
              <span>Jawapan salah berhenti 2s, pelumba AI terus bergerak.</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200">
              <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
              <span>Tamakan larian 1,000m sebelum waktu senja berakhir.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Compact Setup Form fitting comfortably inside 500px height */}
        <div className="md:col-span-7 rounded-xl border border-slate-800 bg-slate-900/90 p-3 sm:p-4 flex flex-col justify-between gap-2.5 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label htmlFor="student-name" className="block text-[11px] font-medium text-slate-300 mb-1">
                Nama Murid
              </label>
              <input
                id="student-name"
                type="text"
                maxLength={28}
                value={playerName}
                onChange={(e) => onChangeName(e.target.value)}
                placeholder="Masukkan nama anda..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <span className="block text-[11px] font-medium text-slate-300 mb-1">
                Tahap Pelumba AI
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => onSelectDifficulty(d.id)}
                    className={`px-2 py-1.5 rounded-lg border text-center transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-500 ${
                      difficulty === d.id
                        ? 'border-amber-500 bg-amber-500/15 text-amber-200'
                        : 'border-slate-700/80 bg-slate-950/60 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-[11px] font-semibold whitespace-nowrap">{d.label}</div>
                    <div className="text-[10px] text-slate-400 whitespace-nowrap">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-slate-300">
                Pilih Kereta atau Unta Gurun
              </span>
              <span className="text-[11px] text-slate-400">
                {vehicle === 'car' ? 'Bunyi ekzos kereta' : 'Bunyi tapak kaki unta'}
              </span>
            </div>

            {/* 4 Compact Selectable Car Image Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
              {CAR_OPTIONS.map((car) => {
                const isSelected = vehicle === 'car' && selectedCarId === car.id;
                const hasError = Boolean(carImgErrors[car.id]);

                return (
                  <button
                    key={car.id}
                    type="button"
                    onClick={() => onSelectCar(car.id)}
                    className={`group relative rounded-lg border overflow-hidden text-left transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-500 ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/12 ring-1 ring-amber-400/50'
                        : 'border-slate-700/80 bg-slate-950/70 hover:border-slate-500'
                    }`}
                  >
                    <div className="relative h-16 sm:h-20 w-full bg-slate-950 overflow-hidden">
                      {!hasError ? (
                        <img
                          src={car.imageUrl}
                          alt={car.name}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setCarImgErrors((prev) => ({ ...prev, [car.id]: true }))
                          }
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
                          <Car className="w-6 h-6 text-amber-400" aria-hidden="true" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/25 to-transparent" />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" aria-hidden="true" />
                        </div>
                      )}
                      <div className="absolute bottom-1 left-2 right-2">
                        <div className="text-[11px] font-semibold text-white truncate">{car.name}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Compact Camel Option */}
            <button
              type="button"
              onClick={onSelectCamel}
              className={`w-full px-3 py-2 rounded-lg border text-left transition-colors duration-150 cursor-pointer flex items-center justify-between gap-2 focus-visible:outline-2 focus-visible:outline-amber-500 ${
                vehicle === 'camel'
                  ? 'border-amber-400 bg-amber-500/12 text-white ring-1 ring-amber-400/50'
                  : 'border-slate-700/80 bg-slate-950/70 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-md bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Compass className="w-4 h-4 text-amber-400" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">Unta Gurun Ramadan</div>
                  <div className="text-[11px] text-slate-400 truncate">Menunggang unta di padang pasir · Bunyi tapak kaki</div>
                </div>
              </div>
              {vehicle === 'camel' && (
                <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" aria-hidden="true" />
                </div>
              )}
            </button>
          </div>

          <div className="pt-0.5">
            <button
              type="button"
              onClick={onStartRace}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-sm transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-current" aria-hidden="true" />
              <span>Mulakan Perlumbaan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
