import type * as Types from '../../../graphql/types.graphql.d';

export type WorkspaceMemberDataFragment = { __typename: 'WorkspaceMember', _id: string, userId: string, name: string, color: string | null, avatar: string | null, memberId: string, roles: Array<{ __typename: 'WorkspaceMemberRole', _id: string, name: string, color: string | null }> };

declare const Document: import("graphql").DocumentNode; export default Document;