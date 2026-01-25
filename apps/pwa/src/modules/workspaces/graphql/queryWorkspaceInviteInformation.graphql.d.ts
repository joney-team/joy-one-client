import type * as Types from '../../../graphql/types.graphql.d';

export type WorkspaceInviteInformationQueryVariables = Types.Exact<{
  inviteCode: Types.Scalars['String']['input'];
}>;


export type WorkspaceInviteInformationQuery = { __typename: 'Query', workspaceInviteInformation: { __typename: 'WorkspaceInviteInformation', workspaceId: string, type: Types.WorkspaceType, name: string, logo: string | null, hotline: string | null, phone: string | null, appColor: string | null, appColorShape: number | null } };


import { TypedDocumentNode } from '@apollo/client/core';
export const WorkspaceInviteInformationDocument = (import("graphql").DocumentNode) as TypedDocumentNode<WorkspaceInviteInformationQuery, WorkspaceInviteInformationQueryVariables>;
export default WorkspaceInviteInformationDocument 