import type * as Types from '../../../graphql/types.graphql.d';

export type WorkspaceBranchesByIdsQueryVariables = Types.Exact<{
  ids: Array<Types.Scalars['String']['input']>;
}>;


export type WorkspaceBranchesByIdsQuery = { __typename: 'Query', branches: Array<{ __typename: 'WorkspaceBranch', _id: string, name: string, hotline: string | null, location: { __typename: 'Location', provinceId: string | null, districtId: string | null, wardId: string | null, address: string | null, coordinates: { __typename: 'Coordinates', lat: number, lng: number } | null }, settings: { __typename: 'WorkspaceBranchSettings', bankAccount: { __typename: 'PluginBankAccount', bankId: number, accountNumber: string, accountName: string | null } | null } | null }> };


import { TypedDocumentNode } from '@apollo/client/core';
export const WorkspaceBranchesByIdsDocument = (import("graphql").DocumentNode) as TypedDocumentNode<WorkspaceBranchesByIdsQuery, WorkspaceBranchesByIdsQueryVariables>;
export default WorkspaceBranchesByIdsDocument 