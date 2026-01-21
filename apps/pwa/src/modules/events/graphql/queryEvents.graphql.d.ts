import type * as Types from '../../../graphql/types.graphql.d';

export type EventsQueryVariables = Types.Exact<{
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  ref?: Types.InputMaybe<Types.Scalars['String']['input']>;
  userId?: Types.InputMaybe<Types.Scalars['String']['input']>;
  type?: Types.InputMaybe<Types.EventType>;
}>;


export type EventsQuery = { __typename: 'Query', events: { __typename: 'EventsPaginated', count: number, data: Array<{ __typename: 'Event', _id: string, time: number, type: Types.EventType, channel: Types.EventChannel | null, userId: string | null, actionType: Types.EventDataActionType | null, data: any | null, persist: boolean | null, variant: Types.EventVariant | null, user: { __typename: 'WorkspaceMember', _id: string, userId: string, name: string, email: string, color: string | null, avatar: string | null, memberId: string | null, workspaceId: string, permissions: Array<string>, workspace: { __typename: 'WorkspaceMemberWorkspaceInfo', _id: string, code: string, type: Types.WorkspaceType, inviteCode: string | null, name: string, logo: string | null, hotline: string | null, locale: string | null, appIcon: string | null, appColor: string | null, appName: string | null, appColorShape: number | null, branches: number, isArchived: boolean, location: { __typename: 'LocationEntity', address: string | null } | null }, workspaceBranches: Array<{ __typename: 'WorkspaceMemberWorkspaceBranchInfo', _id: string, name: string }>, roles: Array<{ __typename: 'WorkspaceMemberRole', _id: string, name: string, color: string | null }> } }> } };

declare const Document: import("graphql").DocumentNode; export default Document;