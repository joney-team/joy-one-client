import type * as Types from '../../../graphql/types.graphql.d';

export type CustomerFormsQueryVariables = Types.Exact<{
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  query?: Types.InputMaybe<Types.Scalars['JSONObject']['input']>;
}>;


export type CustomerFormsQuery = { __typename: 'Query', list: { __typename: 'CustomerFormsPaginated', total: number, results: Array<{ __typename: 'CustomerForm', _id: string, refs: Array<string> | null, createdAt: number | null, updatedAt: number | null, name: string, phone: string, email: string | null, dynamicData: any | null, status: Types.CustomerFormStatus, cancelReason: string | null, workspaceId: string, location: { __typename: 'Location', address: string | null } | null, vnLocation: { __typename: 'Location', address: string | null } | null, workspaceBranch: { __typename: 'WorkspaceBranch', _id: string, name: string } | null }> } };


import { TypedDocumentNode } from '@apollo/client/core';
export const CustomerFormsDocument = (import("graphql").DocumentNode) as TypedDocumentNode<CustomerFormsQuery, CustomerFormsQueryVariables>;
export default CustomerFormsDocument 