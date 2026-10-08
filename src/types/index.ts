export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type UserRole = 'student' | 'teacher';

export interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
  isPublic?: boolean;
}

export interface TaskExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface Task {
  id: number;
  moduleId: number;
  title: string;
  difficulty: Difficulty;
  xp: number;
  shortTheory?: string;
  description: string;
  whatToDo: string;
  inputDesc: string;
  outputDesc: string;
  examples: TaskExample[];
  hints: string[];
  solution: string;
  starterCode?: string;
  tests: TestCase[];
  learnedRecap: string;
  isCustom?: boolean;
  createdBy?: string;
}

export interface CourseModule {
  id: number;
  title: string;
  topic: string;
  description: string;
  difficulty: Difficulty;
  taskCount: number;
  iconName: string;
  theorySummary: string;
}

export interface TestResult {
  testId: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  error?: string;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  error?: string;
  friendlyError?: string;
  errorLine?: number;
  executionTimeMs: number;
  success: boolean;
}

export interface UserProgress {
  userId: string;
  solvedTaskIds: number[];
  viewedHintTaskIds: Record<number, number>; // taskId -> highest hint level unlocked
  viewedSolutionTaskIds: number[];
  xp: number;
  lastActiveDate?: string;
  submissions: TaskSubmission[];
  achievements: string[];
}

export interface TaskSubmission {
  id: string;
  taskId: number;
  code: string;
  passed: boolean;
  timestamp: string;
  executionTimeMs: number;
  error?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'tasks' | 'xp' | 'speed';
}

export interface StudentStatsSummary {
  id: string;
  name: string;
  avatar: string;
  solvedCount: number;
  totalXp: number;
  lastActive: string;
  currentModule: number;
  errorCount: number;
  recentTaskTitle: string;
}
