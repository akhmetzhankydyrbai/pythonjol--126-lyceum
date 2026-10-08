import React from 'react';
import { Award, CheckCircle2, ArrowRight, X, Sparkles, Laptop, AlertCircle } from 'lucide-react';
import { Task, UserProgress } from '../types';
import { MODULES } from '../data/modules';

interface SessionXpModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  tasks: Task[];
  onSelectTask: (taskId: number) => void;
}

export const SessionXpModal: React.FC<SessionXpModalProps> = ({
  isOpen,
  onClose,
  progress,
  tasks,
  onSelectTask,
}) => {
  if (!isOpen) return null;

  const solvedTasks = tasks.filter((t) => progress.solvedTaskIds.includes(t.id));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Laptop className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Осы компьютерде орындалған тапсырмалар
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ағымдағы сессияда жиналған XP және есептер тізімі
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Stats Ribbon */}
        <div className="p-5 bg-gradient-to-r from-amber-50/70 to-emerald-50/70 border-b border-slate-200 grid grid-cols-2 gap-3 text-center">
          <div className="bg-white p-3 rounded-xl border border-amber-200/60 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-medium">Осы сессиядағы XP</div>
            <div className="text-2xl font-black text-amber-600 tabular-nums">
              {progress.xp} XP
            </div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-emerald-200/60 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-medium">Шешілген есептер саны</div>
            <div className="text-2xl font-black text-emerald-600 tabular-nums">
              {solvedTasks.length} / {tasks.length}
            </div>
          </div>
        </div>

        {/* Session Note Warning */}
        <div className="px-5 py-2.5 bg-amber-50/80 border-b border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <b>Ескерту:</b> Ұпайлар тек осы компьютердегі ағымдағы сессияда есептеледі. Бетті жапсаңыз немесе қайта жүктесеңіз, барлық нәтижелер өшіріледі.
          </span>
        </div>

        {/* Solved Tasks List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-2.5">
          {solvedTasks.length > 0 ? (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Сәтті орындалған тапсырмалар ({solvedTasks.length}):
              </div>
              {solvedTasks.map((t) => {
                const mod = MODULES.find((m) => m.id === t.moduleId);
                return (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 flex items-center justify-between gap-3 hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-slate-900">№{t.id}. {t.title}</span>
                          <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-semibold">
                            +{t.xp} XP
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {mod?.title || `${t.moduleId}-модуль`}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectTask(t.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer transition-colors shadow-2xs"
                    >
                      <span>Қайта қарау</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-slate-400" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-800">
                  Бұл компьютерде әлі тапсырма орындалмаған
                </div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  1-тапсырмадан бастап кодты жазып, іске қосыңыз. Әрбір сәтті шешілген есеп үшін осы жерде ұпайлар мен тізім шығады!
                </p>
              </div>
              <button
                onClick={() => {
                  onSelectTask(1);
                  onClose();
                }}
                className="mt-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                1-тапсырманы шешу
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            №126 мектеп-лицейі · 5–6 сыныптар үшін
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Жабу
          </button>
        </div>
      </div>
    </div>
  );
};
