import type * as Types from '../../../graphql/types.graphql.d';

export type PartnersQueryVariables = Types.Exact<{
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  query?: Types.InputMaybe<Types.Scalars['JSONObject']['input']>;
}>;


export type PartnersQuery = { __typename: 'Query', list: { __typename: 'PartnersPaginated', total: number, results: Array<{ __typename: 'Partner', refs: Array<string> | null, createdAt: number | null, updatedAt: number | null, _id: string, name: string, phone: string | null, logo: string | null, email: string | null }> } };


import { TypedDocumentNode } from '@apollo/client/core';
export const PartnersDocument = (import("graphql").DocumentNode) as TypedDocumentNode<PartnersQuery, PartnersQueryVariables>;
export default PartnersDocument 