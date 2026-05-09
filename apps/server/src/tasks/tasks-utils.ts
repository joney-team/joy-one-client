import {
  DefaultTaskStatusId,
  TaskContextType,
  TaskStatus,
} from './tasks.types';

export function normalizeStatuses(
  statuses: Omit<TaskStatus, 'progress' | 'order'>[],
  context?: { contextId: string; contextType: TaskContextType },
) {
  return statuses.map((status, index) => ({
    ...status,
    order: index,
    progress:
      status.id === DefaultTaskStatusId.CLOSED
        ? 100
        : (index / (statuses.length - 1)) * 100,
    contextId: context?.contextId ?? status.contextId,
    contextType: context?.contextType ?? status.contextType,
  }));
}
