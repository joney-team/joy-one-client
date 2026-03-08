import type * as Types from '../../../graphql/types.graphql.d';

export type EventsQueryVariables = Types.Exact<{
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  ref?: Types.InputMaybe<Types.Scalars['String']['input']>;
  userId?: Types.InputMaybe<Types.Scalars['String']['input']>;
  type?: Types.InputMaybe<Types.EventType>;
}>;


export type EventsQuery = { __typename: 'Query', events: { __typename: 'EventsPaginated', total: number, results: Array<{ __typename: 'Event', _id: string, ref: string | null, time: number, type: Types.EventType, channel: Types.EventChannel | null, userId: string | null, actionType: Types.EventDataActionType | null, data: any | null, persist: boolean | null, variant: Types.EventVariant | null, sessionId: string | null, relatedEntities: Array<{ __typename: 'RelatedEntity', entity: string, id: string | null, data: any | null, index: boolean | null }> | null, user: { __typename: 'WorkspaceMember', _id: string, userId: string, name: string, email: string, phone: string | null, color: string | null, avatar: string | null, memberId: string | null, workspaceId: string, permissions: Array<string>, workingTimeType: Types.WorkspaceMemberWorkingTimeType | null, memberDisplayName: string | null, joinedAt: number | null, workspace: { __typename: 'Workspace', _id: string, code: string, type: Types.WorkspaceType, inviteCode: string | null, name: string, logo: string | null, hotline: string | null, phone: string | null, locale: Types.AppLocale | null, appIcon: string | null, appColor: string | null, appName: string | null, appDomain: string | null, appColorShape: number | null, branches: number, isArchived: boolean | null, location: { __typename: 'Location', address: string | null } | null }, workspaceBranches: Array<{ __typename: 'WorkspaceMemberWorkspaceBranchInfo', _id: string, name: string, hotline: string | null }>, roles: Array<{ __typename: 'WorkspaceMemberRole', _id: string, name: string, color: string | null }> } | null }> } };


import { TypedDocumentNode } from '@apollo/client/core';
export const EventsDocument = (import("graphql").DocumentNode) as TypedDocumentNode<EventsQuery, EventsQueryVariables>;
export default EventsDocument 