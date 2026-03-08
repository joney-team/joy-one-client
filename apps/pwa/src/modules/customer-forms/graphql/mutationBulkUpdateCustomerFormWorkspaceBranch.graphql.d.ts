import type * as Types from '../../../graphql/types.graphql.d';

export type BulkUpdateCustomerFormWorkspaceBranchMutationVariables = Types.Exact<{
  input: Types.BulkUpdateWorkspaceBranchInput;
}>;


export type BulkUpdateCustomerFormWorkspaceBranchMutation = { __typename: 'Mutation', bulkUpdateCustomerFormWorkspaceBranch: { __typename: 'CustomerForm', _id: string, refs: Array<string> | null, createdAt: number | null, updatedAt: number | null, name: string, phone: string, email: string | null, dynamicData: any | null, status: Types.CustomerFormStatus, cancelReason: string | null, workspaceId: string, location: { __typename: 'Location', address: string | null } | null, vnLocation: { __typename: 'Location', address: string | null } | null, workspaceBranch: { __typename: 'WorkspaceBranch', _id: string, name: string } | null } };


import { TypedDocumentNode } from '@apollo/client/core';
export const BulkUpdateCustomerFormWorkspaceBranchDocument = (import("graphql").DocumentNode) as TypedDocumentNode<BulkUpdateCustomerFormWorkspaceBranchMutation, BulkUpdateCustomerFormWorkspaceBranchMutationVariables>;
export default BulkUpdateCustomerFormWorkspaceBranchDocument 