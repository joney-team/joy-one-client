import type * as Types from '../../../graphql/types.graphql.d';

export type CustomerKycsQueryVariables = Types.Exact<{
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  query?: Types.InputMaybe<Types.Scalars['JSONObject']['input']>;
}>;


export type CustomerKycsQuery = { __typename: 'Query', list: { __typename: 'CustomerKycsPaginated', total: number, results: Array<{ __typename: 'CustomerKyc', _id: string, customerId: string, status: Types.CustomerKycStatus, customer: { __typename: 'Customer', _id: string, name: string, code: string, phone: string | null }, versions: Array<{ __typename: 'CustomerKycVersion', id: string, frontOfCidImage: string, backOfCidImage: string, portraitImage: string, cidNumber: string, cidFullName: string, cidRaw: string | null, cidGender: Types.Gender, cidBirthday: number, cidCreatedAt: number | null, rejectReason: string | null, createdAt: number, status: Types.CustomerKycStatus, cidLocation: { __typename: 'Location', provinceId: string | null, districtId: string | null, wardId: string | null, address: string | null, coordinates: { __typename: 'Coordinates', lat: number, lng: number } | null } | null, cidVnLocation: { __typename: 'Location', provinceId: string | null, districtId: string | null, wardId: string | null, address: string | null, coordinates: { __typename: 'Coordinates', lat: number, lng: number } | null } | null }> }> } };


import { TypedDocumentNode } from '@apollo/client/core';
export const CustomerKycsDocument = (import("graphql").DocumentNode) as TypedDocumentNode<CustomerKycsQuery, CustomerKycsQueryVariables>;
export default CustomerKycsDocument 