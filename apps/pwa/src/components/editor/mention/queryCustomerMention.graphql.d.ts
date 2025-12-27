import type * as Types from '../../../graphql/types.graphql.d';

export type CustomerMentionQueryVariables = Types.Exact<{
  customerId: Types.Scalars['String']['input'];
}>;


export type CustomerMentionQuery = { __typename: 'Query', customer: { __typename: 'Customer', _id: string, code: string, name: string } };

declare const Document: import("graphql").DocumentNode; export default Document;