import type * as Types from '../../../graphql/types.graphql.d';

export type WorkspaceBranchQueryVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
}>;


export type WorkspaceBranchQuery = { __typename: 'Query', workspaceBranch: { __typename: 'WorkspaceBranch', _id: string, name: string, hotline: string | null, location: { __typename: 'Location', provinceId: string | null, districtId: string | null, wardId: string | null, address: string | null, coordinates: { __typename: 'Coordinates', lat: number, lng: number } | null }, settings: { __typename: 'WorkspaceBranchSettings', bankAccount: { __typename: 'PluginBankAccount', bankId: number, accountNumber: string, accountName: string | null } | null } | null } };


import { TypedDocumentNode } from '@apollo/client/core';
export const WorkspaceBranchDocument = (import("graphql").DocumentNode) as TypedDocumentNode<WorkspaceBranchQuery, WorkspaceBranchQueryVariables>;
export default WorkspaceBranchDocument 