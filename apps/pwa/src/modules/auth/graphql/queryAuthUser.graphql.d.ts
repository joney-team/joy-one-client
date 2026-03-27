import type * as Types from '../../../graphql/types.graphql.d';

export type AuthUserQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type AuthUserQuery = { __typename: 'Query', authUser: { __typename: 'AuthUser', _id: string, name: string, email: string, avatar: string | null, role: Types.UserRole, locale: Types.AppLocale | null, phone: string | null, isEmailVerified: boolean | null, birthday: number | null, isPasswordProvided: boolean, settings: { __typename: 'UserSettings', locale: Types.AppLocale | null, timezoneId: string | null, timezoneUtc: string | null, isStartOfWeekSunday: boolean | null, isTwelveHour: boolean | null } | null } };


import { TypedDocumentNode } from '@apollo/client/core';
export const AuthUserDocument = (import("graphql").DocumentNode) as TypedDocumentNode<AuthUserQuery, AuthUserQueryVariables>;
export default AuthUserDocument 