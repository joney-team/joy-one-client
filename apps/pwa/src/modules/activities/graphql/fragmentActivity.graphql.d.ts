import type * as Types from '../../../graphql/types.graphql.d';

export type ActivityDataFragment = { __typename: 'Activity', _id: string, contextType: Types.ActivityContextType, contextId: string, type: Types.ActivityType, content: string | null, data: any | null, parentId: string | null, childCount: number | null, isPinned: boolean | null, createdAt: number | null, createdByUser: { __typename: 'WorkspaceMember', _id: string, userId: string, name: string, color: string | null, avatar: string | null, memberId: string | null, workspaceId: string, roles: Array<{ __typename: 'WorkspaceMemberRole', _id: string, name: string, color: string | null }> } };

declare const Document: import("graphql").DocumentNode; export default Document;