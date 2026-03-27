import type * as Types from '../../../graphql/types.graphql.d';

export type RemoveMemberMutationVariables = Types.Exact<{
  memberId: Types.Scalars['String']['input'];
}>;


export type RemoveMemberMutation = { __typename: 'Mutation', removeMember: boolean };


import { TypedDocumentNode } from '@apollo/client/core';
export const RemoveMemberDocument = (import("graphql").DocumentNode) as TypedDocumentNode<RemoveMemberMutation, RemoveMemberMutationVariables>;
export default RemoveMemberDocument 