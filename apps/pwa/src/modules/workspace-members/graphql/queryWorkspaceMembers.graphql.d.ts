import type * as Types from '../../../graphql/types.graphql.d';

export type WorkspaceMembersQueryVariables = Types.Exact<{
  ignoreSelf?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
  ids?: Types.InputMaybe<Array<Types.Scalars['String']['input']>>;
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
}>;


export type WorkspaceMembersQuery = { __typename: 'Query', workspaceMembers: { __typename: 'WorkspaceMembersPaginated', count: number, data: Array<{ __typename: 'WorkspaceMember', _id: string, userId: string, name: string, color: string | null, avatar: string | null, memberId: string, roles: Array<{ __typename: 'WorkspaceMemberRole', _id: string, name: string, color: string | null }> }> } };

declare const Document: import("graphql").DocumentNode; export default Document;