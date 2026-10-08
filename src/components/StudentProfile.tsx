import React from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Calendar,
  Sparkles,
  Trophy,
  ArrowRight,
  User,
} from 'lucide-react';
import { UserProfile, UserProgress, Task } from '../types';
import { MODULES } from '../data/modules';
import { ACHIEVEMENTS_LIST, getRankTitle } from '../services/storage';

interface StudentProfileProps {
  user: UserProfile;
  progress: UserProgress;
  tasks: Task[];
  onSelectTask: (taskId: number) => void;
  onOpenAchievements: () => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({
  user,
  progress,
  tasks,
  onSelectTask,
  onOpenAchievements,
}) => {
  const solvedCount = progress.solvedTaskIds.length;
  const totalCount = tasks.length;
  const rank = getRankTitle(progress.xp, solvedCount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-2xl font-mono shadow-sm">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {user.name}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                {rank.title}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
              <span>№126 мектеп-лицейі</span>
              <span>·</span>
              <span>5–6 сынып оқушысы (Осы ПК-дегі сессия)</span>
            </div>
          </div>
        </div>

        {/* Level & Tasks Solved Stats without streak */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex-1 sm:flex-initial p-3 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[100px]">
            <div className="text-[11px] text-slate-500">Жалпы XP</div>
            <div className="text-xl font-bold text-slate-900 tabular-nums">{progress.xp}</div>
          </div>

          <div className="flex-1 sm:flex-initial p-3 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[100px]">
            <div className="text-[11px] text-slate-500">Шешілген есептер</div>
            <div className="text-xl font-bold text-emerald-600 tabular-nums flex items-center justify-center gap-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>{solvedCount} / {totalCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Level progression bar */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>Дәреже деңгейі: {rank.level} / 4 ({rank.title})</span>
          <span className="text-slate-500 tabular-nums">
            Келесі дәрежеге: {Math.max(0, rank.nextLevelXp - progress.xp)} XP қалды
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-amber-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.round((progress.xp / rank.nextLevelXp) * 100))}%` }}
          />
        </div>
      </div>

      {/* Module by Module Completion Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Модульдер бойынша прогресс</h2>
          <span className="text-xs text-slate-500 tabular-nums">
            {solvedCount} / {totalCount} орындалды ({Math.round((solvedCount / totalCount) * 100)}%)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {MODULES.map((m) => {
            const mTasks = tasks.filter((t) => t.moduleId === m.id);
            const mSolved = mTasks.filter((t) => progress.solvedTaskIds.includes(t.id)).length;
            const pct = Math.round((mSolved / mTasks.length) * 100);
            return (
              <div key={m.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 line-clamp-1">{m.id}. {m.topic}</span>
                  <span className="text-[11px] font-bold text-slate-600 tabular-nums">
                    {mSolved}/{mTasks.length}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : 'bg-slate-800'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements Showcase */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">Жетістіктер мен белгілер</h2>
          </div>
          <button
            onClick={onOpenAchievements}
            className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
          >
            Барлығын ашу →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ACHIEVEMENTS_LIST.map((ach) => {
            const isUnlocked = progress.achievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                  isUnlocked
                    ? 'bg-amber-50/50 border-amber-200 text-slate-900'
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <div className="text-2xl shrink-0">{ach.title.split(' ')[0]}</div>
                <div>
                  <div className="text-xs font-bold leading-tight">
                    {ach.title.substring(ach.title.indexOf(' ') + 1)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {ach.description}
                  </div>
                  {isUnlocked && (
                    <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                      ✓ Ашылды
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
