import type * as Types from '../../../graphql/types.graphql.d';

export type WorkspaceMembersOnlineStatusQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type WorkspaceMembersOnlineStatusQuery = { __typename: 'Query', workspaceMembersOnlineStatus: Array<{ __typename: 'WorkspaceMemberOnlineStatus', userId: string, isOnline: boolean }> };

declare const Document: import("graphql").DocumentNode; export default Document;