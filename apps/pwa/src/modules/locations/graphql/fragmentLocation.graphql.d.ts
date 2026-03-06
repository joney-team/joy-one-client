import type * as Types from '../../../graphql/types.graphql.d';

export type LocationDataFragment = { __typename: 'Location', provinceId: string | null, districtId: string | null, wardId: string | null, address: string | null, coordinates: { __typename: 'Coordinates', lat: number, lng: number } | null };


import { TypedDocumentNode } from '@apollo/client/core';
export const LocationDataDocument = (import("graphql").DocumentNode) as TypedDocumentNode<LocationDataFragment>;
export default LocationDataDocument 