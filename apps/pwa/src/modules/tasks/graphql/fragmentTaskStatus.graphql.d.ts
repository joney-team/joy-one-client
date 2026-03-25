import type * as Types from '../../../graphql/types.graphql.d';

export type TaskStatusFragment = { __typename: 'TaskStatus', id: string, name: string | null, color: string | null, order: number, progress: number, contextId: string | null, contextType: Types.TaskContextType | null };


import { TypedDocumentNode } from '@apollo/client/core';
export const TaskStatusDocument = (import("graphql").DocumentNode) as TypedDocumentNode<TaskStatusFragment>;
export default TaskStatusDocument 