import React from 'react';
import { ArrowRight, BookOpen, CheckCircle, Sparkles, Trophy, Target } from 'lucide-react';
import { UserProgress, Task } from '../types';
import { MODULES } from '../data/modules';
import { getRankTitle } from '../services/storage';

interface HeroSectionProps {
  progress: UserProgress;
  tasks: Task[];
  onStartLearning: () => void;
  onSelectTask: (taskId: number) => void;
  onOpenAchievements: () => void;
  onOpenXpHistory: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  progress,
  tasks,
  onStartLearning,
  onSelectTask,
  onOpenAchievements,
  onOpenXpHistory,
}) => {
  const solvedCount = progress.solvedTaskIds.length;
  const totalCount = tasks.length;
  const percentage = Math.round((solvedCount / totalCount) * 100);

  // Find next unsolved task
  const nextUnsolvedTask = tasks.find((t) => !progress.solvedTaskIds.includes(t.id)) || tasks[0];
  const currentModuleId = nextUnsolvedTask ? nextUnsolvedTask.moduleId : 1;
  const currentModule = MODULES.find((m) => m.id === currentModuleId) || MODULES[0];

  const rank = getRankTitle(progress.xp, solvedCount);

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text & Motivation */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 tracking-wide uppercase">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>№126 мектеп-лицейі · 5–6 сыныптар үшін арнайы тренажёр</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Сәлем! Python үйренуге дайынсың ба?
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Бағдарламалауды нөлден бастап үйрен. Тіркелусіз, бірден браузерде кодыңды жазып, тексеріп, нағыз бағдарламашы бол! 12 модуль және әрқайсысында 15 қызықты тапсырма (барлығы 180 есеп).
              </p>
              <div className="text-xs text-slate-500 font-medium">
                Жоба авторы: <b>9 «Ә» Қыдырбай Ахметжан</b> · Жетекшісі: <b>Гүлнұр Қасымханова</b>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                onClick={onStartLearning}
                className="py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-sm group cursor-pointer"
              >
                <span>{solvedCount > 0 ? 'Оқуды жалғастыру' : 'Оқуды бастау'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onSelectTask(nextUnsolvedTask.id)}
                className="py-3 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-medium text-sm transition-colors cursor-pointer"
              >
                Ағымдағы тапсырма: №{nextUnsolvedTask.id} ({currentModule.topic})
              </button>
            </div>

            {/* Progress Card Widget */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 max-w-xl">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">Python жолы</span>
                  <span>·</span>
                  <span>Модуль {currentModuleId} / 12</span>
                </div>
                <div className="font-semibold text-slate-900 tabular-nums">
                  {solvedCount} / {totalCount} тапсырма орындалды ({percentage}%)
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-amber-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(percentage, 4)}%` }}
                />
              </div>

              {/* Stats ribbon with clickable XP to view solved tasks */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 text-center">
                <button
                  onClick={onOpenXpHistory}
                  title="Осы компьютерде орындалған тапсырмаларды көру үшін басыңыз"
                  className="p-2 bg-white rounded-lg border border-amber-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all text-center cursor-pointer group shadow-2xs"
                >
                  <div className="text-[10px] text-amber-700 font-medium group-hover:underline">
                    ПК-дегі XP (көру 👆)
                  </div>
                  <div className="text-base font-bold text-amber-700 tabular-nums">
                    {progress.xp} XP
                  </div>
                </button>
                <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                  <div className="text-[11px] text-slate-500">Орындалған есеп</div>
                  <div className="text-base font-bold text-emerald-600 tabular-nums flex items-center justify-center gap-1">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>{solvedCount} / {totalCount}</span>
                  </div>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                  <div className="text-[11px] text-slate-500">Дәреже</div>
                  <div className="text-xs font-bold text-slate-900 truncate" title={rank.title}>
                    {rank.title.split(' ')[1]}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Educational Visual Banner */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 aspect-16/9">
              <img
                src="/src/assets/images/python_learning_hero_1791465147445.jpg"
                alt="Python үйрену жұмыс үстелі"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div
                style={{ display: 'none' }}
                className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 text-white flex-col items-center justify-center p-6 text-center space-y-2"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-bold text-2xl font-mono">
                  Py
                </div>
                <div className="font-bold text-lg">Python-ды нөлден үйрен</div>
                <div className="text-xs text-slate-300">180 интерактивті тапсырма және автоматты тексеру (12 × 15)</div>
              </div>
            </div>

            {/* Achievement Callout Badge */}
            <button
              onClick={onOpenAchievements}
              className="mt-3 w-full p-3 rounded-xl bg-slate-50 border border-slate-200/90 hover:bg-slate-100 transition-colors flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 group-hover:text-amber-800 transition-colors">
                    {progress.solvedTaskIds.length > 0 ? '🏆 Жетістіктерді қарау' : 'Алғашқы қадамдар'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {progress.achievements.length} / 5 жетістік ашылды
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900">
                Барлығын көру →
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
