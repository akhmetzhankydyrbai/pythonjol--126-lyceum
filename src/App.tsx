import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ModulesView } from './components/ModulesView';
import { TaskView } from './components/TaskView';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentProfile } from './components/StudentProfile';
import { AchievementsModal } from './components/AchievementsModal';
import { SessionXpModal } from './components/SessionXpModal';
import { Task, UserProfile, UserProgress } from './types';
import {
  getCurrentUser,
  getUserProgress,
  getAllTasks,
  checkAndUnlockAchievements,
} from './services/storage';

export default function App() {
  const [currentUser] = useState<UserProfile>(getCurrentUser());
  const [progress, setProgress] = useState<UserProgress>(getUserProgress());
  const [tasks, setTasks] = useState<Task[]>(getAllTasks());

  const [activeTab, setActiveTab] = useState<'home' | 'modules' | 'task' | 'profile' | 'teacher'>('home');
  const [currentTaskId, setCurrentTaskId] = useState<number>(1);

  // Modals
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isXpModalOpen, setIsXpModalOpen] = useState(false);

  // Warn on tab reload or exit that session data will be cleared
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (progress.solvedTaskIds.length > 0 || progress.xp > 0) {
        e.preventDefault();
        e.returnValue = 'Назар аударыңыз! Сайттан шықсаңыз немесе бетті жаңартсаңыз, барлық нәтижелер мен сессия өшіріледі!';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [progress.solvedTaskIds.length, progress.xp]);

  // Update in-memory session progress dynamically
  const handleUpdateProgress = (newProgress: UserProgress) => {
    const { updatedProgress } = checkAndUnlockAchievements(newProgress);
    setProgress(updatedProgress);
  };

  const handleSelectTask = (taskId: number) => {
    setCurrentTaskId(taskId);
    setActiveTab('task');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [...prev, newTask]);
  };

  const currentTask = tasks.find((t) => t.id === currentTaskId) || tasks[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Navigation Top Bar Contract */}
      <Navbar
        currentUser={currentUser}
        progress={progress}
        totalTasksCount={tasks.length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onOpenXpHistory={() => setIsXpModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <div className="space-y-8">
            <HeroSection
              progress={progress}
              tasks={tasks}
              onStartLearning={() => {
                const nextUnsolved = tasks.find((t) => !progress.solvedTaskIds.includes(t.id));
                handleSelectTask(nextUnsolved ? nextUnsolved.id : 1);
              }}
              onSelectTask={handleSelectTask}
              onOpenAchievements={() => setIsAchievementsOpen(true)}
              onOpenXpHistory={() => setIsXpModalOpen(true)}
            />

            {/* Quick Modules Overview below Hero */}
            <ModulesView
              tasks={tasks}
              progress={progress}
              onSelectTask={handleSelectTask}
            />
          </div>
        )}

        {activeTab === 'modules' && (
          <ModulesView
            tasks={tasks}
            progress={progress}
            onSelectTask={handleSelectTask}
          />
        )}

        {activeTab === 'task' && currentTask && (
          <TaskView
            task={currentTask}
            allTasks={tasks}
            onSelectTask={handleSelectTask}
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
            onBackToModules={() => setActiveTab('modules')}
          />
        )}

        {activeTab === 'teacher' && (
          <TeacherDashboard
            tasks={tasks}
            onTaskCreated={handleTaskCreated}
            onSelectTask={handleSelectTask}
          />
        )}

        {activeTab === 'profile' && (
          <StudentProfile
            user={currentUser}
            progress={progress}
            tasks={tasks}
            onSelectTask={handleSelectTask}
            onOpenAchievements={() => setIsAchievementsOpen(true)}
          />
        )}
      </main>

      {/* Quiet, clean educational footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <span className="font-bold text-slate-900">PythonJol</span>
            <span>—</span>
            <span>№126 мектеп-лицейі (9 «Ә» Қыдырбай Ахметжан & жетекшісі Гүлнұр Қасымханова)</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('home')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Басты бет
            </button>
            <button
              onClick={() => setActiveTab('modules')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Модульдер (12)
            </button>
            <button
              onClick={() => setIsXpModalOpen(true)}
              className="hover:text-slate-900 text-amber-700 font-semibold transition-colors cursor-pointer"
            >
              ПК-дегі ұпайлар ({progress.xp} XP)
            </button>
            <button
              onClick={() => setActiveTab('teacher')}
              className="hover:text-slate-900 transition-colors cursor-pointer"
            >
              Мұғалім & Жоба (№126 лицей)
            </button>
            <span>© 2026 №126 мектеп-лицейі</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        progress={progress}
      />

      <SessionXpModal
        isOpen={isXpModalOpen}
        onClose={() => setIsXpModalOpen(false)}
        progress={progress}
        tasks={tasks}
        onSelectTask={handleSelectTask}
      />
    </div>
  );
}
