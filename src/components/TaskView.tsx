import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BookOpen,
  Award,
  Terminal,
  Clock,
  Maximize2,
  Minimize2,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { Task, TestCase, TestResult, ExecutionResult, UserProgress } from '../types';
import { CodeEditor } from './CodeEditor';
import { executePythonCode, translatePythonError } from '../services/pythonRunner';
import { MODULES } from '../data/modules';

interface TaskViewProps {
  task: Task;
  allTasks: Task[];
  onSelectTask: (taskId: number) => void;
  progress: UserProgress;
  onUpdateProgress: (newProgress: UserProgress) => void;
  onBackToModules: () => void;
}

export const TaskView: React.FC<TaskViewProps> = ({
  task,
  allTasks,
  onSelectTask,
  progress,
  onUpdateProgress,
  onBackToModules,
}) => {
  const [code, setCode] = useState(task.starterCode || '');
  const [stdinInput, setStdinInput] = useState(task.examples[0]?.input || '');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraftRestored, setIsDraftRestored] = useState(false);

  // Fullscreen states
  const [isEditorFullScreen, setIsEditorFullScreen] = useState(false);
  const [isTerminalFullScreen, setIsTerminalFullScreen] = useState(false);
  const [showBottomLogs, setShowBottomLogs] = useState(true);

  // Results state
  const [activeTab, setActiveTab] = useState<'output' | 'tests'>('output');
  const [lastExecution, setLastExecution] = useState<ExecutionResult | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [allPassed, setAllPassed] = useState(false);

  // Sync state and restore draft code on task change
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(`pythonjol_task_draft_${task.id}`);
      if (savedDraft !== null && savedDraft !== task.starterCode && savedDraft.trim().length > 0) {
        setCode(savedDraft);
        setIsDraftRestored(true);
      } else {
        setCode(task.starterCode || '');
        setIsDraftRestored(false);
      }
    } catch {
      setCode(task.starterCode || '');
      setIsDraftRestored(false);
    }

    setStdinInput(task.examples[0]?.input || '');
    setLastExecution(null);
    setTestResults([]);
    setAllPassed(false);
    setActiveTab('output');
  }, [task.id]);

  // Handle code change and persist draft
  const handleCodeChange = (newVal: string) => {
    setCode(newVal);
    try {
      localStorage.setItem(`pythonjol_task_draft_${task.id}`, newVal);
    } catch (e) {
      console.error(e);
    }
  };

  // Reset to original starter code
  const handleResetToStarter = () => {
    try {
      localStorage.removeItem(`pythonjol_task_draft_${task.id}`);
    } catch {}
    setCode(task.starterCode || '');
    setIsDraftRestored(false);
  };

  // Exit or toggle full screen with Escape or F11 key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsEditorFullScreen(false);
        setIsTerminalFullScreen(false);
      } else if (e.key === 'F11') {
        e.preventDefault();
        setIsTerminalFullScreen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentModule = MODULES.find((m) => m.id === task.moduleId);
  const isSolved = progress.solvedTaskIds.includes(task.id);

  // Difficulty badge
  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'easy':
        return <span className="text-emerald-700 font-medium">🟢 Жеңіл</span>;
      case 'medium':
        return <span className="text-amber-700 font-medium">🟡 Орташа</span>;
      case 'hard':
        return <span className="text-orange-700 font-medium">🟠 Күрделі</span>;
      case 'expert':
        return <span className="text-rose-700 font-medium">🔴 Өте күрделі</span>;
      default:
        return <span>🟢 Жеңіл</span>;
    }
  };

  // Run with custom stdin
  const handleRunCode = async () => {
    setIsRunning(true);
    setActiveTab('output');
    try {
      const result = await executePythonCode(code, stdinInput);
      setLastExecution(result);
    } catch (e: any) {
      const err = String(e?.message || e);
      const friendly = translatePythonError(err);
      setLastExecution({
        stdout: '',
        stderr: err,
        error: err,
        friendlyError: `${friendly.title}\n\n${friendly.message}`,
        executionTimeMs: 0,
        success: false,
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit and run against test suite
  const handleVerifySolution = async () => {
    setIsSubmitting(true);
    setActiveTab('tests');
    const results: TestResult[] = [];
    let passedCount = 0;

    try {
      for (const test of task.tests) {
        const exec = await executePythonCode(code, test.input);
        const actual = exec.stdout.trim();
        const expected = test.expectedOutput.trim();

        // Exact or line-by-line comparison
        const passed = exec.success && actual === expected;
        if (passed) passedCount++;

        results.push({
          testId: test.id,
          input: test.input,
          expectedOutput: expected,
          actualOutput: actual,
          passed,
          error: exec.friendlyError || exec.error,
        });
      }

      setTestResults(results);
      const isCompleteSuccess = passedCount === task.tests.length;
      setAllPassed(isCompleteSuccess);

      if (isCompleteSuccess && !isSolved) {
        // Full XP earned upon passing
        const xpEarned = task.xp;

        const newProgress: UserProgress = {
          ...progress,
          solvedTaskIds: [...progress.solvedTaskIds, task.id],
          xp: progress.xp + xpEarned,
          submissions: [
            ...progress.submissions,
            {
              id: Date.now().toString(),
              taskId: task.id,
              code,
              passed: true,
              timestamp: new Date().toISOString(),
              executionTimeMs: 15,
            },
          ],
        };
        onUpdateProgress(newProgress);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigation handlers
  const currentIndex = allTasks.findIndex((t) => t.id === task.id);
  const prevTask = currentIndex > 0 ? allTasks[currentIndex - 1] : null;
  const nextTask = currentIndex < allTasks.length - 1 ? allTasks[currentIndex + 1] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToModules}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Модульдерге оралу"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>{currentModule?.title || `${task.moduleId}-модуль`}</span>
              <span>·</span>
              <span>{task.id}-тапсырма</span>
              <span>·</span>
              {getDifficultyBadge(task.difficulty)}
              {isSolved && (
                <>
                  <span>·</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Шешілді
                  </span>
                </>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              {task.id}. {task.title}
            </h1>
          </div>
        </div>

        {/* Task navigation buttons */}
        <div className="flex items-center gap-2">
          {prevTask && (
            <button
              onClick={() => onSelectTask(prevTask.id)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Алдыңғы</span>
            </button>
          )}

          {/* Task selector dropdown */}
          <select
            value={task.id}
            onChange={(e) => onSelectTask(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            {allTasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id}-тапсырма: {t.title.slice(0, 24)}...
              </option>
            ))}
          </select>

          {nextTask && (
            <button
              onClick={() => onSelectTask(nextTask.id)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors flex items-center gap-1"
            >
              <span>Келесі</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Split Layout: Desktop 2-column, Mobile stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
        {/* LEFT COLUMN: Task details, instructions, examples (No hints, copy-protected) */}
        <div
          className="lg:col-span-5 space-y-5 select-none"
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        >
          {/* Anti-copy notice */}
          <div className="p-3 rounded-xl bg-slate-100/90 border border-slate-200 text-slate-600 text-xs flex items-center gap-2.5 shadow-2xs">
            <Lock className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-[11px] leading-relaxed">
              <b>Көшіруге тыйым салынған:</b> Тапсырмаларды көшіріп алмай, мұғалімнің түсіндірмесімен өз бетіңізбен ойланып орындаңыз.
            </span>
          </div>

          {/* Short Theory Block */}
          {task.shortTheory && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-950">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>Қысқаша теория</span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-amber-900">
                {task.shortTheory}
              </p>
            </div>
          )}

          {/* Task Description */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider text-xs text-slate-500 mb-1">
                Тапсырма сипаттамасы
              </h2>
              <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed font-medium">
                {task.description}
              </p>
            </div>

            {/* What to do? (Не істеу керек?) */}
            <div className="pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5 text-blue-700">
                <span>Не істеу керек?</span>
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                {task.whatToDo}
              </p>
            </div>

            {/* Input & Output formats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-xs font-semibold text-slate-600 mb-1">Кіріс деректері:</div>
                <div className="text-xs text-slate-700 leading-relaxed">{task.inputDesc}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-xs font-semibold text-slate-600 mb-1">Шығыс деректері:</div>
                <div className="text-xs text-slate-700 leading-relaxed">{task.outputDesc}</div>
              </div>
            </div>

            {/* Examples (Мысалдар) */}
            <div className="pt-3 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Мысал:
              </div>
              {task.examples.map((ex, idx) => (
                <div key={idx} className="bg-slate-900 rounded-lg p-3 text-xs font-mono text-slate-200 space-y-2">
                  {ex.input && (
                    <div>
                      <span className="text-slate-400 text-[11px] block mb-0.5">Кіріс:</span>
                      <pre className="text-amber-300 whitespace-pre-wrap">{ex.input}</pre>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400 text-[11px] block mb-0.5">Шығыс:</span>
                    <pre className="text-emerald-400 whitespace-pre-wrap">{ex.output}</pre>
                  </div>
                  {ex.explanation && (
                    <div className="text-slate-400 text-[11px] font-sans pt-1 border-t border-slate-800">
                      💡 {ex.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Today I Learned (Бүгін не үйрендің?) */}
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-1.5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>🧠 Бүгін не үйрендің?</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {task.learnedRecap}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Code Editor, Stdin Input, Execution, Output, Test Results */}
        <div className="lg:col-span-7 space-y-5">
          {/* The Dark Code Editor */}
          <div>
            {isDraftRestored && (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 mb-2.5">
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Алдыңғы кодың қалпына келтірілді
                </span>
                <button
                  onClick={handleResetToStarter}
                  className="text-amber-800 underline hover:text-amber-950 font-semibold cursor-pointer"
                >
                  Бастапқы кодқа қайтару
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Python коды (Редактор)
              </label>
              <div className="text-xs text-slate-500">
                +{task.xp} XP мүмкіндігі
              </div>
            </div>

            <CodeEditor
              value={code}
              onChange={handleCodeChange}
              onRun={handleRunCode}
              onReset={handleResetToStarter}
              isRunning={isRunning || isSubmitting}
              errorLine={lastExecution?.errorLine}
              errorMessage={lastExecution?.error || lastExecution?.stderr}
              isFullScreen={isEditorFullScreen}
              onToggleFullScreen={() => setIsEditorFullScreen(!isEditorFullScreen)}
            />
          </div>

          {/* Custom Stdin Input Block (Кіріс деректері) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-600" />
                <span>Кіріс деректері (input / stdin)</span>
              </label>
              {task.examples[0]?.input && (
                <button
                  onClick={() => setStdinInput(task.examples[0].input)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Мысалдағы мәнді қою
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Кодта <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">input()</code> шақырылғанда, осы өрістегі мәтін қабылданады:
            </p>
            <textarea
              value={stdinInput}
              onChange={(e) => setStdinInput(e.target.value)}
              placeholder="Егер тапсырмада input() болса, осында мән жазыңыз..."
              rows={2}
              className="w-full font-mono text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-y"
            />
          </div>

          {/* Action Buttons: Run & Submit */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRunCode}
              disabled={isRunning || isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              <span>{isRunning ? 'Орындалуда...' : 'Кодты іске қосу'}</span>
            </button>

            <button
              onClick={handleVerifySolution}
              disabled={isRunning || isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{isSubmitting ? 'Тексерілуде...' : 'Жауапты тексеру'}</span>
            </button>
          </div>

          {/* Results Tabs: Output vs Tests */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="flex items-center border-b border-slate-200 bg-slate-50 px-3">
              <button
                onClick={() => setActiveTab('output')}
                className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'output'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Нәтиже (Терминал)
              </button>
              <button
                onClick={() => setActiveTab('tests')}
                className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'tests'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Тесттер</span>
                {testResults.length > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      allPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {testResults.filter((t) => t.passed).length}/{testResults.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsTerminalFullScreen(true)}
                title="Терминалды толық экранға ашу (F11 немесе шерту)"
                className="ml-auto px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:bg-indigo-800 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400/50 hover:ring-indigo-300 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer animate-in fade-in active:scale-95 group"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                <Maximize2 className="w-3.5 h-3.5 text-white group-hover:scale-110 transition-transform" />
                <span>Толық экран</span>
                <span className="hidden sm:inline text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono text-white border border-white/30">
                  F11
                </span>
              </button>
            </div>

            <div className="p-4">
              {/* Reminder banner about clicking terminal and F11/Esc shortcuts */}
              <div
                onClick={() => setIsTerminalFullScreen(true)}
                title="Толық экранға ашу үшін шертіңіз (Шығу: Esc / F11)"
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] bg-indigo-50/90 hover:bg-indigo-100/90 border border-indigo-200 hover:border-indigo-300 px-3 py-2 rounded-xl mb-3 select-none cursor-pointer transition-all shadow-2xs group"
              >
                <div className="flex items-center gap-2 text-indigo-950 font-medium">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" />
                  </span>
                  <span>
                    💡 <b>Ескерту:</b> Терминалды үлкейту үшін оның <b>кез келген жерінен басыңыз</b> немесе <b>«Толық экран (F11)»</b> батырмасын шертіңіз.
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-indigo-800 font-semibold shrink-0">
                  <span className="text-indigo-600 font-normal">Шығу:</span>
                  <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-indigo-200 shadow-2xs">Esc</kbd>
                  <span className="text-slate-400">не</span>
                  <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-indigo-200 shadow-2xs">F11</kbd>
                </div>
              </div>

              {activeTab === 'output' && (
                <div>
                  {lastExecution ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Статус: {lastExecution.success ? '✅ Сәтті' : '❌ Қатемен аяқталды'}</span>
                        <span className="flex items-center gap-1 tabular-nums">
                          <Clock className="w-3 h-3" />
                          {lastExecution.executionTimeMs} ms
                        </span>
                      </div>

                      {/* Friendly error card if failed */}
                      {lastExecution.friendlyError && (
                        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1.5">
                          <div className="font-bold flex items-center gap-1.5 text-rose-700">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>Қате табылды</span>
                          </div>
                          <p className="whitespace-pre-line leading-relaxed">
                            {lastExecution.friendlyError}
                          </p>
                        </div>
                      )}

                      {/* Terminal Output (Clickable to open fullscreen) */}
                      <div
                        onClick={() => setIsTerminalFullScreen(true)}
                        title="Толық экранға ашу үшін шертіңіз (Шығу: Esc немесе F11)"
                        className="bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/80 rounded-xl p-3.5 text-xs font-mono text-slate-100 min-h-[110px] overflow-x-auto cursor-pointer transition-all group relative shadow-inner"
                      >
                        <div className="absolute top-2.5 right-2.5 bg-slate-800/90 group-hover:bg-indigo-600 text-slate-300 group-hover:text-white text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 border border-slate-700 pointer-events-none transition-colors shadow-2xs">
                          <Maximize2 className="w-3 h-3" />
                          <span>Толық экран (F11)</span>
                        </div>
                        {lastExecution.stdout ? (
                          <pre className="whitespace-pre-wrap">{lastExecution.stdout}</pre>
                        ) : (
                          <div className="py-6 flex flex-col items-center justify-center text-slate-500 gap-1.5">
                            <span className="italic">Шығыс деректер жоқ (бос)</span>
                            <span className="text-[11px] text-indigo-400 font-sans font-medium flex items-center gap-1">
                              <Maximize2 className="w-3 h-3" />
                              Толық экранда көру үшін басыңыз
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => setIsTerminalFullScreen(true)}
                      title="Толық экранға ашу үшін басыңыз (Шығу: Esc / F11)"
                      className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/20 rounded-xl cursor-pointer transition-all space-y-2 group"
                    >
                      <div>«Кодты іске қосу» батырмасын басып, бағдарламаның нәтижесін осы жерден көріңіз.</div>
                      <div className="inline-flex items-center gap-1.5 text-[11px] text-indigo-600 group-hover:text-indigo-700 font-semibold bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Терминалды толық экранға ашу үшін басыңыз (F11 / Esc)</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'tests' && (
                <div>
                  {testResults.length > 0 ? (
                    <div className="space-y-4">
                      {/* Overall test banner */}
                      {allPassed ? (
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                              ✓
                            </div>
                            <div>
                              <div className="text-sm font-bold">Барлық тесттер сәтті өтті!</div>
                              <div className="text-xs text-emerald-700">Тамаша! Сізге +{task.xp} XP қосылды.</div>
                            </div>
                          </div>
                          {nextTask && (
                            <button
                              onClick={() => onSelectTask(nextTask.id)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                            >
                              <span>Келесі есеп</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>Кейбір тесттер өтпеді. Қателерді қарап, шешімді түзетіңіз.</span>
                        </div>
                      )}

                      {/* Test cases breakdown */}
                      <div className="space-y-3">
                        {testResults.map((t, i) => (
                          <div
                            key={i}
                            className={`p-3.5 rounded-lg border text-xs font-mono space-y-2 ${
                              t.passed ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'
                            }`}
                          >
                            <div className="flex items-center justify-between font-sans">
                              <span className="font-bold text-slate-800">{i + 1}-тест</span>
                              <span
                                className={`font-semibold flex items-center gap-1 ${
                                  t.passed ? 'text-emerald-700' : 'text-rose-700'
                                }`}
                              >
                                {t.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                {t.passed ? 'Дұрыс!' : 'Қате'}
                              </span>
                            </div>

                            {t.input && (
                              <div className="text-slate-600">
                                <span className="font-sans text-[11px] text-slate-400 block">Кіріс:</span>
                                <div className="bg-white p-2 rounded border border-slate-200 text-slate-800">
                                  {t.input}
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <span className="font-sans text-[11px] text-slate-400 block">Күтілетін нәтиже:</span>
                                <div className="bg-white p-2 rounded border border-slate-200 text-slate-800 whitespace-pre-wrap">
                                  {t.expectedOutput}
                                </div>
                              </div>
                              <div>
                                <span className="font-sans text-[11px] text-slate-400 block">Сенің нәтижең:</span>
                                <div
                                  className={`p-2 rounded border whitespace-pre-wrap ${
                                    t.passed
                                      ? 'bg-white border-emerald-200 text-emerald-800'
                                      : 'bg-white border-rose-200 text-rose-800'
                                  }`}
                                >
                                  {t.actualOutput || <span className="italic text-slate-400">бос</span>}
                                </div>
                              </div>
                            </div>

                            {t.error && (
                              <div className="font-sans p-2 rounded bg-rose-100/70 text-rose-900 text-xs">
                                {t.error}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      «Жауапты тексеру» батырмасын басып, барлық автоматты тесттерді іске қосыңыз.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Terminal Modal */}
      {isTerminalFullScreen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsTerminalFullScreen(false);
          }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in-50 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden shadow-2xl border border-slate-700 cursor-default"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800 text-white">
              <div className="flex items-center gap-2.5 font-mono text-sm">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">Терминал және Тесттер (Толық экран)</span>
                <span className="text-xs text-slate-400 hidden sm:inline">· №{task.id} {task.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning || isSubmitting}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{isRunning ? 'Орындалуда...' : 'Іске қосу'}</span>
                </button>
                <button
                  onClick={handleVerifySolution}
                  disabled={isRunning || isSubmitting}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Тексерілуде...' : 'Тексеру'}</span>
                </button>
                <button
                  onClick={() => setIsTerminalFullScreen(false)}
                  title="Шығу: Esc немесе F11 батырмасын басыңыз"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 hover:border-rose-500/60 border border-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-xs"
                >
                  <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Кішірейту</span>
                  <span className="text-[10px] bg-slate-700/80 px-1 py-0.2 rounded font-mono text-slate-300">
                    Esc / F11
                  </span>
                </button>
              </div>
            </div>

            {/* Modal Body: Tabs */}
            <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-5 text-xs font-medium">
              <button
                onClick={() => setActiveTab('output')}
                className={`py-2.5 px-4 font-semibold border-b-2 transition-colors ${
                  activeTab === 'output'
                    ? 'border-emerald-400 text-emerald-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Нәтиже (stdout)
              </button>
              <button
                onClick={() => setActiveTab('tests')}
                className={`py-2.5 px-4 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'tests'
                    ? 'border-emerald-400 text-emerald-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Автоматты тесттер</span>
                {testResults.length > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      allPassed ? 'bg-emerald-900 text-emerald-300' : 'bg-rose-900 text-rose-300'
                    }`}
                  >
                    {testResults.filter((t) => t.passed).length}/{testResults.length}
                  </span>
                )}
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 font-mono text-xs text-slate-200">
              {activeTab === 'output' && (
                <div className="space-y-4">
                  {lastExecution ? (
                    <>
                      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                        <span>Статус: {lastExecution.success ? '✅ Сәтті орындалды' : '❌ Қате'}</span>
                        <span>{lastExecution.executionTimeMs} ms</span>
                      </div>

                      {lastExecution.friendlyError && (
                        <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs space-y-2">
                          <div className="font-bold text-rose-300 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Қате табылды</span>
                          </div>
                          <p className="whitespace-pre-line leading-relaxed">
                            {lastExecution.friendlyError}
                          </p>
                        </div>
                      )}

                      <div>
                        <div className="text-[11px] text-slate-400 mb-1">Терминал шығысы:</div>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 min-h-[220px] overflow-auto">
                          {lastExecution.stdout ? (
                            <pre className="whitespace-pre-wrap text-emerald-300 font-mono text-sm leading-relaxed">
                              {lastExecution.stdout}
                            </pre>
                          ) : (
                            <span className="text-slate-500 italic">Шығыс деректер жоқ</span>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-16 text-center text-slate-500">
                      «Іске қосу» батырмасын басып, толық экранда нәтижені көріңіз.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'tests' && (
                <div className="space-y-3">
                  {testResults.length > 0 ? (
                    testResults.map((t, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border ${
                          t.passed
                            ? 'bg-emerald-950/30 border-emerald-800 text-emerald-200'
                            : 'bg-rose-950/30 border-rose-800 text-rose-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm">{idx + 1}-тест</span>
                          <span className="font-semibold flex items-center gap-1">
                            {t.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                            {t.passed ? 'Сәтті өтті' : 'Қате'}
                          </span>
                        </div>
                        {t.input && (
                          <div className="text-slate-400 mb-1">
                            <span className="text-slate-500 text-[10px] block">Кіріс:</span>
                            <div className="bg-slate-950 p-2 rounded text-slate-200">{t.input}</div>
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          <div>
                            <span className="text-slate-500 text-[10px] block">Күтілетін нәтиже:</span>
                            <div className="bg-slate-950 p-2 rounded text-slate-200">{t.expectedOutput}</div>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block">Сенің нәтижең:</span>
                            <div className={`p-2 rounded ${t.passed ? 'bg-slate-950 text-emerald-300' : 'bg-slate-950 text-rose-300'}`}>
                              {t.actualOutput || '(бос)'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-16 text-center text-slate-500">
                      «Тексеру» батырмасын басып, барлық тесттерді іске қосыңыз.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Docked Bottom Terminal & Diagnostics Logs Panel */}
            <div className="border-t border-slate-800 bg-slate-950/95 flex flex-col shrink-0">
              {/* Bottom Panel Header */}
              <div className="flex items-center justify-between px-5 py-2.5 bg-slate-950 border-b border-slate-800/80 text-xs text-slate-300 select-none">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-semibold text-slate-200">
                    Төменгі терминал мен логтар (Консоль)
                  </span>
                  {lastExecution ? (
                    lastExecution.success ? (
                      <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1 font-sans">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Сәтті (0 қате)
                      </span>
                    ) : (
                      <span className="text-[10px] bg-rose-950/80 text-rose-300 border border-rose-800/80 px-2 py-0.5 rounded-full flex items-center gap-1 font-sans font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                        {lastExecution.errorLine ? `${lastExecution.errorLine}-жолда қате` : 'Қате табылды'}
                      </span>
                    )
                  ) : (
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-sans">
                      Күтуде
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {lastExecution && (
                    <button
                      onClick={() => setLastExecution(null)}
                      title="Логтарды тазарту"
                      className="px-2 py-0.5 rounded text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Тазарту
                    </button>
                  )}
                  <button
                    onClick={() => setShowBottomLogs(!showBottomLogs)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showBottomLogs ? '▼ Жасыру' : '▲ Логтарды көрсету'}</span>
                  </button>
                </div>
              </div>

              {/* Bottom Panel Content */}
              {showBottomLogs && (
                <div className="p-4 max-h-56 overflow-y-auto font-mono text-xs text-slate-300 space-y-3 dark-scrollbar">
                  {lastExecution ? (
                    <>
                      {/* Error Diagnostics with Highlighted Line Snippet */}
                      {!lastExecution.success && (
                        <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 space-y-2.5 shadow-inner">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-rose-300 flex items-center gap-1.5 text-xs">
                              <AlertTriangle className="w-4 h-4 text-rose-400" />
                              Қате туралы толық ақпарат:
                            </span>
                            {lastExecution.errorLine && (
                              <span className="text-[11px] font-bold bg-rose-900 text-rose-100 px-2 py-0.5 rounded border border-rose-700">
                                Жол нөмірі: {lastExecution.errorLine}
                              </span>
                            )}
                          </div>

                          {/* Code Snippet pointing to exact error line */}
                          {(() => {
                            const codeLines = code.split('\n');
                            const errLineNum = lastExecution.errorLine;
                            if (!errLineNum || errLineNum > codeLines.length) return null;
                            const startIdx = Math.max(0, errLineNum - 2);
                            const endIdx = Math.min(codeLines.length, errLineNum + 1);

                            return (
                              <div className="bg-slate-950/90 p-3 rounded-lg border border-rose-800/80 font-mono text-xs my-1">
                                <div className="text-[10px] text-slate-400 mb-1.5 flex items-center justify-between border-b border-slate-800 pb-1">
                                  <span>Кодтағы қате табылған жол:</span>
                                  <span className="text-rose-400 font-bold">solution.py</span>
                                </div>
                                <div className="space-y-1">
                                  {codeLines.slice(startIdx, endIdx).map((ln, i) => {
                                    const lineNo = startIdx + i + 1;
                                    const isErr = lineNo === errLineNum;
                                    return (
                                      <div
                                        key={lineNo}
                                        className={`flex items-center gap-2.5 px-2 py-1 rounded ${
                                          isErr
                                            ? 'bg-rose-900/60 text-white font-bold border-l-4 border-rose-500 shadow-xs'
                                            : 'text-slate-400'
                                        }`}
                                      >
                                        <span className="w-6 text-right select-none opacity-60 font-mono text-[11px]">
                                          {lineNo}
                                        </span>
                                        <span className="text-rose-400 font-bold">{isErr ? '➔' : ' '}</span>
                                        <span className="whitespace-pre">{ln || ' '}</span>
                                        {isErr && (
                                          <span className="ml-auto text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded font-sans uppercase tracking-wider">
                                            Қате осында
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}

                          {/* Friendly error message */}
                          {lastExecution.friendlyError && (
                            <p className="whitespace-pre-line leading-relaxed text-rose-100 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/40">
                              {lastExecution.friendlyError}
                            </p>
                          )}

                          {/* Raw Traceback with color coding */}
                          {lastExecution.stderr && (
                            <div className="mt-2 text-[11px] text-slate-400">
                              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                                Python Traceback:
                              </div>
                              <pre className="bg-slate-950 p-2 rounded text-rose-300 font-mono overflow-x-auto whitespace-pre-wrap">
                                {lastExecution.stderr}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Success Logs */}
                      {lastExecution.success && (
                        <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-900/60 text-slate-200 space-y-2">
                          <div className="flex items-center justify-between text-emerald-400 font-semibold">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" />
                              Бағдарлама сәтті орындалды
                            </span>
                            <span className="text-slate-400 font-normal text-[11px]">
                              {lastExecution.executionTimeMs} ms
                            </span>
                          </div>
                          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                              Консоль шығысы (stdout):
                            </div>
                            <pre className="text-emerald-300 font-mono text-xs whitespace-pre-wrap">
                              {lastExecution.stdout || '(Шығыс деректер бос)'}
                            </pre>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="py-6 text-center text-slate-500 flex flex-col items-center justify-center gap-1">
                      <Terminal className="w-5 h-5 text-slate-600 mb-1" />
                      <span>Логтар әзірше бос.</span>
                      <span className="text-[11px] text-slate-400">
                        Кодты іске қосқанда мұнда нәтиже, қате анықталған жолдар және толық түсіндірме шығады.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
