import type * as Types from '../../../graphql/types.graphql.d';

export type TaskMetricsQueryVariables = Types.Exact<{
  contextType: Types.TaskContextType;
  contextId?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type TaskMetricsQuery = { __typename: 'Query', taskMetrics: { __typename: 'TaskMetrics', contextType: Types.TaskContextType, contextId: string | null, estimatedTime: number | null, progress: number | null, totalTasks: number | null, inProgressTasks: number | null, startDate: number | null, dueDate: number | null, overdueTasks: number | null } };


import { TypedDocumentNode } from '@apollo/client/core';
export const TaskMetricsDocument = (import("graphql").DocumentNode) as TypedDocumentNode<TaskMetricsQuery, TaskMetricsQueryVariables>;
export default TaskMetricsDocument 