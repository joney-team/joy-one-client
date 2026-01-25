import type * as Types from '../../../graphql/types.graphql.d';

export type CreateWorkspaceRoleMutationVariables = Types.Exact<{
  name: Types.Scalars['String']['input'];
  permissions: Array<Types.Scalars['String']['input']>;
  description?: Types.InputMaybe<Types.Scalars['String']['input']>;
  color?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type CreateWorkspaceRoleMutation = { __typename: 'Mutation', createWorkspaceRole: { __typename: 'WorkspaceRole', _id: string, name: string, description: string | null, color: string | null, permissions: Array<string>, isEditable: boolean } };


import { TypedDocumentNode } from '@apollo/client/core';
export const CreateWorkspaceRoleDocument = (import("graphql").DocumentNode) as TypedDocumentNode<CreateWorkspaceRoleMutation, CreateWorkspaceRoleMutationVariables>;
export default CreateWorkspaceRoleDocument 