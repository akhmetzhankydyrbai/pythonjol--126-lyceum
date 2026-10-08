import { Task } from '../../types';
import { MODULE_1_TASKS } from './module1_tasks';
import { MODULE_2_TASKS } from './module2_tasks';
import { MODULE_3_TASKS } from './module3_tasks';
import { MODULE_4_TASKS } from './module4_tasks';
import { MODULE_5_TASKS } from './module5_tasks';
import { MODULE_6_TASKS } from './module6_tasks';
import { MODULE_7_TASKS } from './module7_tasks';
import { MODULE_8_TASKS } from './module8_tasks';
import { MODULE_9_TASKS } from './module9_tasks';
import { MODULE_10_TASKS } from './module10_tasks';
import { MODULE_11_TASKS } from './module11_tasks';
import { MODULE_12_TASKS } from './module12_tasks';

export const INITIAL_TASKS: Task[] = [
  ...MODULE_1_TASKS,
  ...MODULE_2_TASKS,
  ...MODULE_3_TASKS,
  ...MODULE_4_TASKS,
  ...MODULE_5_TASKS,
  ...MODULE_6_TASKS,
  ...MODULE_7_TASKS,
  ...MODULE_8_TASKS,
  ...MODULE_9_TASKS,
  ...MODULE_10_TASKS,
  ...MODULE_11_TASKS,
  ...MODULE_12_TASKS,
];

export function getInitialTasks(): Task[] {
  return [...INITIAL_TASKS];
}
