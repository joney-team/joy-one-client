import type * as Types from '../../../graphql/types.graphql.d';

export type TransferWorkspaceOwnerMutationVariables = Types.Exact<{
  input: Types.TransferOwnerInput;
}>;


export type TransferWorkspaceOwnerMutation = { __typename: 'Mutation', transferWorkspaceOwner: boolean };


import { TypedDocumentNode } from '@apollo/client/core';
export const TransferWorkspaceOwnerDocument = (import("graphql").DocumentNode) as TypedDocumentNode<TransferWorkspaceOwnerMutation, TransferWorkspaceOwnerMutationVariables>;
export default TransferWorkspaceOwnerDocument 