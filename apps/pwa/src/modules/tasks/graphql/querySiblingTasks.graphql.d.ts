import type * as Types from '../../../graphql/types.graphql.d';

export type SiblingTasksQueryVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
}>;


export type SiblingTasksQuery = { __typename: 'Query', siblingTasks: { __typename: 'SiblingTasks', previous: { __typename: 'Task', _id: string, code: string, name: string } | null, next: { __typename: 'Task', _id: string, code: string, name: string } | null } };


import { TypedDocumentNode } from '@apollo/client/core';
export const SiblingTasksDocument = (import("graphql").DocumentNode) as TypedDocumentNode<SiblingTasksQuery, SiblingTasksQueryVariables>;
export default SiblingTasksDocument 