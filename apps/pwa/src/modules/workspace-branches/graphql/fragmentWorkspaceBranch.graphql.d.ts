import type * as Types from '../../../graphql/types.graphql.d';

export type WorkspaceBranchDataFragment = { __typename: 'WorkspaceBranch', _id: string, name: string, hotline: string | null, location: { __typename: 'LocationEntity', provinceId: string | null, districtId: string | null, wardId: string | null, address: string | null, coordinates: { __typename: 'Coordinates', lat: number, lng: number } | null } };


import { TypedDocumentNode } from '@apollo/client/core';
export const WorkspaceBranchDataDocument = (import("graphql").DocumentNode) as TypedDocumentNode<WorkspaceBranchDataFragment>;
export default WorkspaceBranchDataDocument 