import type * as Types from '../../../graphql/types.graphql.d';

export type WorkspaceMembersOnlineStatusQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type WorkspaceMembersOnlineStatusQuery = { __typename: 'Query', workspaceMembersOnlineStatus: Array<{ __typename: 'WorkspaceMemberOnlineStatus', userId: string, isOnline: boolean }> };


import { TypedDocumentNode } from '@apollo/client/core';
export const WorkspaceMembersOnlineStatusDocument = (import("graphql").DocumentNode) as TypedDocumentNode<WorkspaceMembersOnlineStatusQuery, WorkspaceMembersOnlineStatusQueryVariables>;
export default WorkspaceMembersOnlineStatusDocument 