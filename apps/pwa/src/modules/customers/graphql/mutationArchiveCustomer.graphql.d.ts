import type * as Types from '../../../graphql/types.graphql.d';

export type ArchiveCustomerMutationVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
}>;


export type ArchiveCustomerMutation = { __typename: 'Mutation', archiveCustomer: boolean };


import { TypedDocumentNode } from '@apollo/client/core';
export const ArchiveCustomerDocument = (import("graphql").DocumentNode) as TypedDocumentNode<ArchiveCustomerMutation, ArchiveCustomerMutationVariables>;
export default ArchiveCustomerDocument 