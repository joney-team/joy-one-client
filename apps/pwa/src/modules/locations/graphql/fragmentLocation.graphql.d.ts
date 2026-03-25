import type * as Types from '../../../graphql/types.graphql.d';

export type LocationFragment = { __typename: 'Location', provinceId: string | null, districtId: string | null, wardId: string | null, address: string | null, coordinates: { __typename: 'Coordinates', lat: number, lng: number } | null };


import { TypedDocumentNode } from '@apollo/client/core';
export const LocationDocument = (import("graphql").DocumentNode) as TypedDocumentNode<LocationFragment>;
export default LocationDocument 