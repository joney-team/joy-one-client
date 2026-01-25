import type * as Types from '../../../graphql/types.graphql.d';

export type DeleteWorkspaceRoleMutationVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
}>;


export type DeleteWorkspaceRoleMutation = { __typename: 'Mutation', deleteWorkspaceRole: boolean };


import { TypedDocumentNode } from '@apollo/client/core';
export const DeleteWorkspaceRoleDocument = (import("graphql").DocumentNode) as TypedDocumentNode<DeleteWorkspaceRoleMutation, DeleteWorkspaceRoleMutationVariables>;
export default DeleteWorkspaceRoleDocument 