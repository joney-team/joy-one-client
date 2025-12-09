import type * as Types from '../../../../graphql/types.graphql.d';

export type TaskCustomersQueryVariables = Types.Exact<{
  ids?: Types.InputMaybe<Array<Types.Scalars['String']['input']>>;
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
}>;


export type TaskCustomersQuery = { __typename: 'Query', customers: { __typename: 'CustomersPaginated', count: number, data: Array<{ __typename: 'Customer', _id: string, code: string, name: string, avatar: string | null, phone: string | null }> } };

declare const Document: import("graphql").DocumentNode; export default Document;