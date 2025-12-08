import type * as Types from '../../../graphql/types.graphql.d';

export type UserWorkspaceMemberQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type UserWorkspaceMemberQuery = { __typename: 'Query', userWorkspaceMember: { __typename: 'WorkspaceMember', _id: string, userId: string, name: string, color: string | null, avatar: string | null, memberId: string, roles: Array<{ __typename: 'WorkspaceMemberRole', _id: string, name: string, color: string | null }> } };

declare const Document: import("graphql").DocumentNode; export default Document;