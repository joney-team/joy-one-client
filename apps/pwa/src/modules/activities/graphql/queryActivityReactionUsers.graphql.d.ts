import type * as Types from '../../../graphql/types.graphql.d';

export type ActivityReactionUsersQueryVariables = Types.Exact<{
  ignoreSelf?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
  userIds?: Types.InputMaybe<Array<Types.Scalars['String']['input']>>;
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
}>;


export type ActivityReactionUsersQuery = { __typename: 'Query', users: { __typename: 'WorkspaceMembersPaginated', total: number, results: Array<{ __typename: 'WorkspaceMember', _id: string, name: string }> } };


import { TypedDocumentNode } from '@apollo/client/core';
export const ActivityReactionUsersDocument = (import("graphql").DocumentNode) as TypedDocumentNode<ActivityReactionUsersQuery, ActivityReactionUsersQueryVariables>;
export default ActivityReactionUsersDocument 