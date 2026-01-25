import type * as Types from '../../../graphql/types.graphql.d';

export type WorkspaceStatsQueryVariables = Types.Exact<{
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  query?: Types.InputMaybe<Types.Scalars['JSONObject']['input']>;
}>;


export type WorkspaceStatsQuery = { __typename: 'Query', list: { __typename: 'WorkspaceStatsPaginated', total: number, results: Array<{ __typename: 'WorkspaceStat', refs: Array<string> | null, createdAt: number | null, updatedAt: number | null, _id: string, storageUsage: number | null, memberCount: number | null, bookingCount: number | null, customerCount: number | null, orderCount: number | null, workspace: { __typename: 'WorkspaceStatWorkspaceInformation', _id: string, logo: string | null, name: string, type: Types.WorkspaceType } }> } };


import { TypedDocumentNode } from '@apollo/client/core';
export const WorkspaceStatsDocument = (import("graphql").DocumentNode) as TypedDocumentNode<WorkspaceStatsQuery, WorkspaceStatsQueryVariables>;
export default WorkspaceStatsDocument 