import type * as Types from '../../../graphql/types.graphql.d';

export type GenerateWorkspaceInviteCodeMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type GenerateWorkspaceInviteCodeMutation = { __typename: 'Mutation', generateWorkspaceInviteCode: string };


import { TypedDocumentNode } from '@apollo/client/core';
export const GenerateWorkspaceInviteCodeDocument = (import("graphql").DocumentNode) as TypedDocumentNode<GenerateWorkspaceInviteCodeMutation, GenerateWorkspaceInviteCodeMutationVariables>;
export default GenerateWorkspaceInviteCodeDocument 