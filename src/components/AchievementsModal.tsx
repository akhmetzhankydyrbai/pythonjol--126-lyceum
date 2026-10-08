import React from 'react';
import { Trophy, CheckCircle2, Lock } from 'lucide-react';
import { UserProgress } from '../types';
import { ACHIEVEMENTS_LIST } from '../services/storage';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  progress,
}) => {
  if (!isOpen) return null;

  const unlockedCount = progress.achievements.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">
              Оқу жетістіктері ({unlockedCount} / {ACHIEVEMENTS_LIST.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {ACHIEVEMENTS_LIST.map((ach) => {
            const isUnlocked = progress.achievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border flex items-center gap-3.5 transition-all ${
                  isUnlocked
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="text-3xl shrink-0">{ach.title.split(' ')[0]}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-900">
                      {ach.title.substring(ach.title.indexOf(' ') + 1)}
                    </div>
                    {isUnlocked ? (
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ашылды
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> Жабық
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                    {ach.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
          >
            Жабу
          </button>
        </div>
      </div>
    </div>
  );
};
