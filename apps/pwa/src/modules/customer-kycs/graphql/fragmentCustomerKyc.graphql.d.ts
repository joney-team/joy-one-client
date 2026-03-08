import type * as Types from '../../../graphql/types.graphql.d';

export type CustomerKycDataFragment = { __typename: 'CustomerKyc', _id: string, customerId: string, status: Types.CustomerKycStatus, customer: { __typename: 'Customer', _id: string, name: string, code: string, phone: string | null }, versions: Array<{ __typename: 'CustomerKycVersion', id: string, frontOfCidImage: string, backOfCidImage: string, portraitImage: string, cidNumber: string, cidFullName: string, cidRaw: string | null, cidGender: Types.Gender, cidBirthday: number, cidCreatedAt: number | null, rejectReason: string | null, createdAt: number, status: Types.CustomerKycStatus, cidLocation: { __typename: 'Location', provinceId: string | null, districtId: string | null, wardId: string | null, address: string | null, coordinates: { __typename: 'Coordinates', lat: number, lng: number } | null } | null, cidVnLocation: { __typename: 'Location', provinceId: string | null, districtId: string | null, wardId: string | null, address: string | null, coordinates: { __typename: 'Coordinates', lat: number, lng: number } | null } | null }> };


import { TypedDocumentNode } from '@apollo/client/core';
export const CustomerKycDataDocument = (import("graphql").DocumentNode) as TypedDocumentNode<CustomerKycDataFragment>;
export default CustomerKycDataDocument 