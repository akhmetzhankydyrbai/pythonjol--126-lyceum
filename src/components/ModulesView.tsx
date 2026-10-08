import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Terminal,
  Database,
  Calculator,
  GitBranch,
  Type,
  RotateCw,
  Repeat,
  ListOrdered,
  Layers,
  Code,
  Shuffle,
  Cpu,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { CourseModule, Task, UserProgress } from '../types';
import { MODULES } from '../data/modules';

interface ModulesViewProps {
  tasks: Task[];
  progress: UserProgress;
  onSelectTask: (taskId: number) => void;
}

export const ModulesView: React.FC<ModulesViewProps> = ({
  tasks,
  progress,
  onSelectTask,
}) => {
  const [expandedModuleId, setExpandedModuleId] = useState<number>(1);

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'easy':
        return <span className="text-emerald-700 text-xs font-semibold">🟢 Жеңіл</span>;
      case 'medium':
        return <span className="text-amber-700 text-xs font-semibold">🟡 Орташа</span>;
      case 'hard':
        return <span className="text-orange-700 text-xs font-semibold">🟠 Күрделі</span>;
      case 'expert':
        return <span className="text-rose-700 text-xs font-semibold">🔴 Өте күрделі</span>;
      default:
        return <span>🟢 Жеңіл</span>;
    }
  };

  const getModuleIcon = (name: string) => {
    const props = { className: 'w-5 h-5 text-slate-700' };
    switch (name) {
      case 'Terminal':
        return <Terminal {...props} />;
      case 'Database':
        return <Database {...props} />;
      case 'Calculator':
        return <Calculator {...props} />;
      case 'GitBranch':
        return <GitBranch {...props} />;
      case 'Type':
        return <Type {...props} />;
      case 'RotateCw':
        return <RotateCw {...props} />;
      case 'Repeat':
        return <Repeat {...props} />;
      case 'ListOrdered':
        return <ListOrdered {...props} />;
      case 'Layers':
        return <Layers {...props} />;
      case 'Code':
        return <Code {...props} />;
      case 'Shuffle':
        return <Shuffle {...props} />;
      case 'Cpu':
        return <Cpu {...props} />;
      default:
        return <BookOpen {...props} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Оқу бағдарламасы мен модульдер
        </h2>
        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
          Python-ды нөлден бастап алгоритмдерге дейін меңгеретін 12 негізгі модуль. Әр тақырыпты ретімен оқып, біліміңізді бекітіңіз.
        </p>
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        {MODULES.map((mod) => {
          const moduleTasks = tasks.filter((t) => t.moduleId === mod.id);
          const solvedInModule = moduleTasks.filter((t) =>
            progress.solvedTaskIds.includes(t.id)
          ).length;
          const isModuleComplete =
            moduleTasks.length > 0 && solvedInModule === moduleTasks.length;
          const isExpanded = expandedModuleId === mod.id;

          return (
            <div
              key={mod.id}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                isExpanded ? 'border-slate-300 shadow-sm' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Module Header / Bar */}
              <div
                onClick={() => setExpandedModuleId(isExpanded ? 0 : mod.id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isModuleComplete
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isModuleComplete ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      getModuleIcon(mod.iconName)
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <span>{mod.id}-модуль</span>
                      <span>·</span>
                      {getDifficultyBadge(mod.difficulty)}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                      {mod.description}
                    </p>
                  </div>
                </div>

                {/* Progress count & chevron */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900 tabular-nums">
                      {solvedInModule} / {mod.taskCount} тапсырма
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {Math.round((solvedInModule / mod.taskCount) * 100)}% аяқталды
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Tasks List */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/40 space-y-4">
                  {/* Module Theory Callout */}
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed">
                    <div className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5 text-blue-700">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Модульдің негізгі түсінігі</span>
                    </div>
                    {mod.theorySummary}
                  </div>

                  {/* Tasks Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {moduleTasks.map((t) => {
                      const isTaskSolved = progress.solvedTaskIds.includes(t.id);
                      return (
                        <div
                          key={t.id}
                          onClick={() => onSelectTask(t.id)}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer group flex flex-col justify-between select-none ${
                            isTaskSolved
                              ? 'bg-emerald-50/30 border-emerald-200 hover:border-emerald-300'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between text-[11px] mb-1.5">
                              <span className="font-mono text-slate-500">№{t.id}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-400 font-medium">+{t.xp} XP</span>
                                {isTaskSolved ? (
                                  <span className="text-emerald-600 font-semibold flex items-center gap-0.5 text-[11px]">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Шешілді
                                  </span>
                                ) : (
                                  getDifficultyBadge(t.difficulty)
                                )}
                              </div>
                            </div>
                            <div className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-slate-950 transition-colors line-clamp-1">
                              {t.title}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                              {t.whatToDo}
                            </p>
                          </div>

                          <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium group-hover:text-slate-900">
                            <span>Шешуді бастау</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
