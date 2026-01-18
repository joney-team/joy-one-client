import type * as Types from '../../../graphql/types.graphql.d';

export type EventsQueryVariables = Types.Exact<{
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  ref?: Types.InputMaybe<Types.Scalars['String']['input']>;
  userId?: Types.InputMaybe<Types.Scalars['String']['input']>;
  type?: Types.InputMaybe<Types.EventType>;
}>;


export type EventsQuery = { __typename: 'Query', events: { __typename: 'EventsPaginated', count: number, data: Array<{ __typename: 'Event', _id: string, time: number, type: Types.EventType, channel: Types.EventChannel, userId: string | null, actionType: Types.EventDataActionType | null, data: any | null, persist: boolean | null, variant: Types.EventVariant | null, user: { __typename: 'WorkspaceMember', _id: string, userId: string, name: string, color: string | null, avatar: string | null, memberId: string | null, workspaceId: string, roles: Array<{ __typename: 'WorkspaceMemberRole', _id: string, name: string, color: string | null }> } }> } };

declare const Document: import("graphql").DocumentNode; export default Document;