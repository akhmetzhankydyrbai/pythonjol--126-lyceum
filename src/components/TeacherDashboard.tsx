import React from 'react';
import {
  GraduationCap,
  User,
  School,
  Sparkles,
  BookOpen,
  Code2,
  CheckCircle2,
  HeartHandshake,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Task } from '../types';

interface TeacherDashboardProps {
  tasks: Task[];
  onTaskCreated?: (newTask: Task) => void;
  onSelectTask: (taskId: number) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  tasks,
  onSelectTask,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Hero School & Project Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-12 border border-slate-800 shadow-xl">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 text-xs font-semibold uppercase tracking-wider">
            <School className="w-4 h-4 text-amber-400" />
            <span>№126 мектеп-лицейі</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            PythonJol — Жас бағдарламашылар тренажёрі
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Бұл білім беру веб-платформасы <b>№126 мектеп-лицейінің</b> 5–6 сынып оқушыларына арнайы Python бағдарламалау тілін нөлден, қарапайым әрі қазақ тілінде терең меңгеру үшін жасалған.
          </p>
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Author & Teacher Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Creator Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4 relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-2xl font-mono shadow-md">
              ҚА
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                Жоба авторы мен әзірлеушісі
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                Қыдырбай Ахметжан
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                9 «Ә» сынып оқушысы · №126 мектеп-лицейі
              </p>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
            «Мен бұл сайтты өз мектебімнің 5–6 сыныбында оқитын кіші іні-қарындастарыма арнап жасадым. Бағдарламалауды бастағанда қиындық көрмей, бірден браузерде қазақша түсініп, Python тілін үйренсін деген мақсатпен дайындадым.»
          </div>
        </div>

        {/* Teacher / Supervisor Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4 relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl font-mono shadow-md">
              ГҚ
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                Информатика пәні мұғалімі / Ғылыми жетекші
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                Гүлнұр Қасымханова
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Информатика пәні мұғалімі · №126 мектеп-лицейі
              </p>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
            Жас өнертапқыш пен болашақ бағдарламашылардың цифрлық сауаттылығын арттыруға, информатика сабағында логикалық ойлауды дамытуға бағытталған оқу-әдістемелік жетекшілік.
          </div>
        </div>
      </div>

      {/* For 5-6th Graders: Educational Purpose & Principles */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
            <Lightbulb className="w-4 h-4 text-indigo-500" />
            <span>5–6 сынып оқушылары үшін арнайы</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Бұл тренажёр несімен ерекше?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Бағдарламалауды өмірінде бірінші рет көріп тұрған жас шәкіртке арналған ең қолайлы орта:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              1
            </div>
            <h4 className="text-xs font-bold text-slate-900">Ештеңе орнатудың қажеті жоқ</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Компьютерге күрделі бағдарламалар жүктемей-ақ, мектепте не үйде кез келген браузерден код жазып, тексере беруге болады.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              2
            </div>
            <h4 className="text-xs font-bold text-slate-900">Толық ана тілінде (Қазақша)</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Барлық тапсырмалардың шарты, түсініктемелері мен қателердің шешу жолдары қарапайым қазақ тілінде түсіндірілген.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              3
            </div>
            <h4 className="text-xs font-bold text-slate-900">Қадам-қадаммен үйрену</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              1-модуль қарапайым экранға шығарудан басталып, 12-модульге дейін әрқайсысы 15 қызықты тапсырмадан тұрады (барлығы 180 есеп).
            </p>
          </div>
        </div>

        {/* Start button */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <span className="text-xs text-slate-500 font-medium">
            Барлығы: {tasks.length} интерактивті тапсырма дайын
          </span>
          <button
            onClick={() => onSelectTask(1)}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <span>Оқуды бастау (1-тапсырма)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
