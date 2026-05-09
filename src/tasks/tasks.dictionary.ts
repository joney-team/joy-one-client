import { AppLocale, Dictionary } from '../lang/lang.types';
import { DefaultTaskStatusId, TaskPriority } from './tasks.types';

export const taskPriorityDictionary: Dictionary<TaskPriority> = {
  prefix: 'task_priority',
  dictionary: {
    [TaskPriority.HIGH]: {
      [AppLocale.vi]: 'Cao',
      [AppLocale.en]: 'High',
    },
    [TaskPriority.MEDIUM]: {
      [AppLocale.vi]: 'Bình thường',
      [AppLocale.en]: 'Medium',
    },
    [TaskPriority.LOW]: {
      [AppLocale.vi]: 'Thấp',
      [AppLocale.en]: 'Low',
    },
    [TaskPriority.URGENT]: {
      [AppLocale.vi]: 'Khẩn cấp',
      [AppLocale.en]: 'Urgent',
    },
  },
};