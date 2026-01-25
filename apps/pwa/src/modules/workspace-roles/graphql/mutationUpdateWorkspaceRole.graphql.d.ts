import type * as Types from '../../../graphql/types.graphql.d';

export type UpdateWorkspaceRoleMutationVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
  name: Types.Scalars['String']['input'];
  permissions: Array<Types.Scalars['String']['input']>;
  description?: Types.InputMaybe<Types.Scalars['String']['input']>;
  color?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type UpdateWorkspaceRoleMutation = { __typename: 'Mutation', updateWorkspaceRole: { __typename: 'WorkspaceRole', _id: string, name: string, description: string | null, color: string | null, permissions: Array<string>, isEditable: boolean } };


import { TypedDocumentNode } from '@apollo/client/core';
export const UpdateWorkspaceRoleDocument = (import("graphql").DocumentNode) as TypedDocumentNode<UpdateWorkspaceRoleMutation, UpdateWorkspaceRoleMutationVariables>;
export default UpdateWorkspaceRoleDocument 