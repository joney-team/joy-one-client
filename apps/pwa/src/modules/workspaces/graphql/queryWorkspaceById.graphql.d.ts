import type * as Types from '../../../graphql/types.graphql.d';

export type WorkspaceByIdQueryVariables = Types.Exact<{
  workspaceByIdId: Types.Scalars['String']['input'];
}>;


export type WorkspaceByIdQuery = { __typename: 'Query', workspaceById: { __typename: 'Workspace', _id: string, code: string, type: Types.WorkspaceType, inviteCode: string | null, name: string, logo: string | null, hotline: string | null, phone: string | null, locale: Types.AppLocale | null, appIcon: string | null, appColor: string | null, appName: string | null, appDomain: string | null, appColorShape: number | null, branches: number, isArchived: boolean | null, location: { __typename: 'Location', address: string | null } | null } };


import { TypedDocumentNode } from '@apollo/client/core';
export const WorkspaceByIdDocument = (import("graphql").DocumentNode) as TypedDocumentNode<WorkspaceByIdQuery, WorkspaceByIdQueryVariables>;
export default WorkspaceByIdDocument 