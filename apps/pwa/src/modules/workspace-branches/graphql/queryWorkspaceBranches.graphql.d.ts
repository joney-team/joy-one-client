import type * as Types from '../../../graphql/types.graphql.d';

export type WorkspaceBranchesQueryVariables = Types.Exact<{
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  query?: Types.InputMaybe<Types.Scalars['JSONObject']['input']>;
}>;


export type WorkspaceBranchesQuery = { __typename: 'Query', list: { __typename: 'WorkspaceBranchesPaginated', total: number, results: Array<{ __typename: 'WorkspaceBranch', _id: string, name: string, hotline: string | null, location: { __typename: 'LocationEntity', provinceId: string | null, districtId: string | null, wardId: string | null, address: string | null, coordinates: { __typename: 'Coordinates', lat: number, lng: number } | null } }> } };


import { TypedDocumentNode } from '@apollo/client/core';
export const WorkspaceBranchesDocument = (import("graphql").DocumentNode) as TypedDocumentNode<WorkspaceBranchesQuery, WorkspaceBranchesQueryVariables>;
export default WorkspaceBranchesDocument 