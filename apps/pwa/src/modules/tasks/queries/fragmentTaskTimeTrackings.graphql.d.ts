import type * as Types from '../../../graphql/types.graphql.d';

export type TaskTimeTrackingDataFragment = { __typename: 'TaskTimeTracking', id: string, workspaceId: string, userId: string, billable: boolean | null, note: string | null, startAt: number, endAt: number | null, user: { __typename: 'WorkspaceMemberInfo', _id: string, name: string, color: string | null, avatar: string | null } | null };

declare const Document: import("graphql").DocumentNode; export default Document;