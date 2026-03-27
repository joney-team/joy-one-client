import type * as Types from '../../../graphql/types.graphql.d';

export type JoinWorkspaceWithInviteCodeMutationVariables = Types.Exact<{
  inviteCode: Types.Scalars['String']['input'];
}>;


export type JoinWorkspaceWithInviteCodeMutation = { __typename: 'Mutation', joinWorkspaceWithInviteCode: string };


import { TypedDocumentNode } from '@apollo/client/core';
export const JoinWorkspaceWithInviteCodeDocument = (import("graphql").DocumentNode) as TypedDocumentNode<JoinWorkspaceWithInviteCodeMutation, JoinWorkspaceWithInviteCodeMutationVariables>;
export default JoinWorkspaceWithInviteCodeDocument 