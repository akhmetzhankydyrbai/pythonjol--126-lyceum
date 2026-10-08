import { Task, UserProgress, UserProfile, Achievement, StudentStatsSummary, UserRole } from '../types';
import { INITIAL_TASKS } from '../data/tasks';

const STORAGE_KEYS = {
  CURRENT_USER: 'pythonjol_current_user',
  USER_PROGRESS: 'pythonjol_user_progress',
  CUSTOM_TASKS: 'pythonjol_custom_tasks',
  STUDENTS_LIST: 'pythonjol_classroom_students',
};

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: 'first_task',
    title: '🏆 Бірінші тапсырма',
    description: 'Алғашқы тапсырмаңды сәтті шештің!',
    icon: 'Award',
    category: 'tasks',
  },
  {
    id: 'beginner_15',
    title: '🐍 Python бастаушы',
    description: '15 тапсырманы сәтті орындадың (1 толық модуль)!',
    icon: 'Sparkles',
    category: 'tasks',
  },
  {
    id: 'coder_50',
    title: '💻 Python оқушысы',
    description: '50 тапсырманы бағындырдың!',
    icon: 'Code',
    category: 'tasks',
  },
  {
    id: 'pro_100',
    title: '⚡ Python бағдарламашы',
    description: '100 тапсырманы сәтті орындадың!',
    icon: 'ShieldCheck',
    category: 'tasks',
  },
  {
    id: 'master_180',
    title: '🚀 Python шебері',
    description: 'Барлық 180 тапсырманы толық аяқтадың!',
    icon: 'Rocket',
    category: 'tasks',
  },
];

export const DEFAULT_STUDENT_USER: UserProfile = {
  id: 'student_1',
  name: 'Оқушы (№126 мектеп-лицейі)',
  email: 'student@school126.edu.kz',
  role: 'student',
};

export const DEFAULT_TEACHER_USER: UserProfile = {
  id: 'teacher_1',
  name: 'Гүлнұр Қасымханова',
  email: 'gulnur@school126.edu.kz',
  role: 'teacher',
};

// Initial session progress (not persisted permanently, awarded per task during session)
export function getInitialProgress(): UserProgress {
  return {
    userId: 'student_pc',
    solvedTaskIds: [],
    viewedHintTaskIds: {},
    viewedSolutionTaskIds: [],
    xp: 0,
    submissions: [],
    achievements: [],
  };
}

export function getCurrentUser(): UserProfile {
  return DEFAULT_STUDENT_USER;
}

export function setCurrentUser(_user: UserProfile) {
  // Session only
}

export function getUserProgress(): UserProgress {
  return getInitialProgress();
}

export function saveUserProgress(_progress: UserProgress) {
  // Persistence disabled as requested: session-only progress
}

export function getAllTasks(): Task[] {
  return [...INITIAL_TASKS];
}

export function saveCustomTask(_newTask: Task) {
  // Kept for interface compatibility
}

export function checkAndUnlockAchievements(progress: UserProgress): { newAchievements: string[]; updatedProgress: UserProgress } {
  const newAchievements: string[] = [];
  const current = new Set(progress.achievements);

  if (progress.solvedTaskIds.length >= 1 && !current.has('first_task')) {
    newAchievements.push('first_task');
    current.add('first_task');
  }
  if (progress.solvedTaskIds.length >= 15 && !current.has('beginner_15')) {
    newAchievements.push('beginner_15');
    current.add('beginner_15');
  }
  if (progress.solvedTaskIds.length >= 50 && !current.has('coder_50')) {
    newAchievements.push('coder_50');
    current.add('coder_50');
  }
  if (progress.solvedTaskIds.length >= 100 && !current.has('pro_100')) {
    newAchievements.push('pro_100');
    current.add('pro_100');
  }
  if (progress.solvedTaskIds.length >= 180 && !current.has('master_180')) {
    newAchievements.push('master_180');
    current.add('master_180');
  }

  const updatedProgress: UserProgress = {
    ...progress,
    achievements: Array.from(current),
  };

  if (newAchievements.length > 0) {
    saveUserProgress(updatedProgress);
  }

  return { newAchievements, updatedProgress };
}

export function getRankTitle(xp: number, solvedCount: number): { title: string; nextLevelXp: number; level: number } {
  if (solvedCount >= 120 || xp >= 2500) {
    return { title: 'Python Developer (Шебер)', nextLevelXp: 3500, level: 4 };
  }
  if (solvedCount >= 60 || xp >= 1200) {
    return { title: 'Python Coder (Бағдарламашы)', nextLevelXp: 2500, level: 3 };
  }
  if (solvedCount >= 15 || xp >= 300) {
    return { title: 'Python Student (Оқушы)', nextLevelXp: 1200, level: 2 };
  }
  return { title: 'Python Beginner (Бастаушы)', nextLevelXp: 300, level: 1 };
}
