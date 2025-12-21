import type * as Types from '../../../graphql/types.graphql.d';

export type TaskTimeTrackingDataFragment = { __typename: 'TaskTimeTracking', id: string, workspaceId: string, userId: string, note: string | null, startAt: number, endAt: number | null, user: { __typename: 'WorkspaceMember', _id: string, userId: string, name: string, color: string | null, avatar: string | null, memberId: string | null, workspaceId: string, roles: Array<{ __typename: 'WorkspaceMemberRole', _id: string, name: string, color: string | null }> } | null };

declare const Document: import("graphql").DocumentNode; export default Document;