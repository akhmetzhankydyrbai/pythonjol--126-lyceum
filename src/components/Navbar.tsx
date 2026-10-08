import React from 'react';
import { Award, GraduationCap, CheckCircle, School, Laptop } from 'lucide-react';
import { UserProfile, UserProgress } from '../types';

interface NavbarProps {
  currentUser: UserProfile;
  progress: UserProgress;
  totalTasksCount: number;
  activeTab: 'home' | 'modules' | 'task' | 'profile' | 'teacher';
  setActiveTab: (tab: 'home' | 'modules' | 'task' | 'profile' | 'teacher') => void;
  onOpenAchievements: () => void;
  onOpenXpHistory: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  progress,
  totalTasksCount,
  activeTab,
  setActiveTab,
  onOpenAchievements,
  onOpenXpHistory,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Wordmark with School Attribution */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-mono font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              Py
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 block leading-tight">
                PythonJol
              </span>
              <span className="text-[10px] text-slate-500 hidden sm:block leading-none">
                №126 мектеп-лицейі · 5–6 сыныптар үшін
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('home')}
            className={`hover:text-slate-900 transition-colors ${
              activeTab === 'home' ? 'text-slate-900 font-semibold' : ''
            }`}
          >
            Басты бет
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`hover:text-slate-900 transition-colors ${
              activeTab === 'modules' ? 'text-slate-900 font-semibold' : ''
            }`}
          >
            Модульдер (12)
          </button>
          <button
            onClick={() => setActiveTab('task')}
            className={`hover:text-slate-900 transition-colors ${
              activeTab === 'task' ? 'text-slate-900 font-semibold' : ''
            }`}
          >
            Тапсырмалар
          </button>
          <button
            onClick={onOpenAchievements}
            className="hover:text-slate-900 transition-colors flex items-center gap-1.5"
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span>Жетістіктер</span>
          </button>
          <button
            onClick={() => setActiveTab('teacher')}
            className={`hover:text-slate-900 transition-colors flex items-center gap-1.5 ${
              activeTab === 'teacher' ? 'text-slate-900 font-semibold' : ''
            }`}
          >
            <School className="w-4 h-4 text-indigo-600" />
            <span>Мұғалім & Жоба (№126 лицей)</span>
          </button>
        </nav>

        {/* Zone 3: XP button (Clickable to view solved tasks on this PC) */}
        <div className="flex items-center gap-3">
          {/* Clickable XP badge to inspect solved tasks on this PC */}
          <button
            onClick={onOpenXpHistory}
            title="Осы компьютерде орындалған тапсырмаларды көру үшін басыңыз"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300 text-xs font-semibold transition-all cursor-pointer shadow-2xs group"
          >
            <Laptop className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
            <span className="text-slate-600 font-medium hidden sm:inline">ПК-де:</span>
            <span className="tabular-nums font-bold text-amber-700">{progress.xp} XP</span>
            <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-bold">
              {progress.solvedTaskIds.length}/{totalTasksCount}
            </span>
          </button>

          {/* School badge */}
          <button
            onClick={() => setActiveTab('teacher')}
            title="Жоба авторлары мен мұғалім туралы ақпарат"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs text-slate-700 cursor-pointer"
          >
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span className="text-[11px] font-medium">9 «Ә» Ахметжан</span>
          </button>
        </div>
      </div>

      {/* Mobile subnavigation bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 bg-slate-50/80 px-2 py-2 text-xs font-medium text-slate-600">
        <button
          onClick={() => setActiveTab('home')}
          className={`px-2 py-1 rounded ${activeTab === 'home' ? 'text-slate-900 font-bold bg-white shadow-xs' : ''}`}
        >
          Басты бет
        </button>
        <button
          onClick={() => setActiveTab('modules')}
          className={`px-2 py-1 rounded ${activeTab === 'modules' ? 'text-slate-900 font-bold bg-white shadow-xs' : ''}`}
        >
          Модульдер
        </button>
        <button
          onClick={() => setActiveTab('task')}
          className={`px-2 py-1 rounded ${activeTab === 'task' ? 'text-slate-900 font-bold bg-white shadow-xs' : ''}`}
        >
          Тапсырма ({progress.solvedTaskIds.length}/{totalTasksCount})
        </button>
        <button
          onClick={onOpenXpHistory}
          className="px-2 py-1 rounded text-amber-700 font-bold bg-amber-50"
        >
          {progress.xp} XP 💻
        </button>
        <button
          onClick={() => setActiveTab('teacher')}
          className={`px-2 py-1 rounded ${activeTab === 'teacher' ? 'text-slate-900 font-bold bg-white shadow-xs' : ''}`}
        >
          Жоба (126)
        </button>
      </div>
    </header>
  );
};
