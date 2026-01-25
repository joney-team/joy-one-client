import type * as Types from '../../../graphql/types.graphql.d';

export type PrescriptionsQueryVariables = Types.Exact<{
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  query?: Types.InputMaybe<Types.Scalars['JSONObject']['input']>;
}>;


export type PrescriptionsQuery = { __typename: 'Query', list: { __typename: 'PrescriptionsPaginated', total: number, results: Array<{ __typename: 'Prescription', _id: string, name: string, items: any, note: string | null }> } };


import { TypedDocumentNode } from '@apollo/client/core';
export const PrescriptionsDocument = (import("graphql").DocumentNode) as TypedDocumentNode<PrescriptionsQuery, PrescriptionsQueryVariables>;
export default PrescriptionsDocument 