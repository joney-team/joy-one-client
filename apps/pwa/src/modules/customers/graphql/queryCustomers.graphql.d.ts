import type * as Types from '../../../graphql/types.graphql.d';

export type CustomersQueryVariables = Types.Exact<{
  ids?: Types.InputMaybe<Array<Types.Scalars['String']['input']>>;
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
}>;


export type CustomersQuery = { __typename: 'Query', customers: { __typename: 'CustomersPaginated', count: number, data: Array<{ __typename: 'Customer', _id: string, code: string, name: string, avatar: string | null, phone: string | null }> } };


import { TypedDocumentNode } from '@apollo/client/core';
export const CustomersDocument = (import("graphql").DocumentNode) as TypedDocumentNode<CustomersQuery, CustomersQueryVariables>;
export default CustomersDocument 