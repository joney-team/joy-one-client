import type * as Types from '../../../graphql/types.graphql.d';

export type UpdateWorkspaceMutationVariables = Types.Exact<{
  name: Types.Scalars['String']['input'];
  type: Types.WorkspaceType;
  logo?: Types.InputMaybe<Types.Scalars['String']['input']>;
  location?: Types.InputMaybe<Types.LocationInput>;
  hotline?: Types.InputMaybe<Types.Scalars['String']['input']>;
  phone?: Types.InputMaybe<Types.Scalars['String']['input']>;
  appIcon?: Types.InputMaybe<Types.Scalars['String']['input']>;
  appDomain?: Types.InputMaybe<Types.Scalars['String']['input']>;
  appName?: Types.InputMaybe<Types.Scalars['String']['input']>;
  appColor?: Types.InputMaybe<Types.Scalars['String']['input']>;
  appColorShape?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  locale?: Types.InputMaybe<Types.AppLocale>;
}>;


export type UpdateWorkspaceMutation = { __typename: 'Mutation', updateWorkspace: { __typename: 'Workspace', _id: string, code: string, type: Types.WorkspaceType, inviteCode: string | null, name: string, logo: string | null, hotline: string | null, phone: string | null, locale: Types.AppLocale | null, appIcon: string | null, appColor: string | null, appName: string | null, appDomain: string | null, appColorShape: number | null, branches: number, isArchived: boolean | null, location: { __typename: 'LocationEntity', address: string | null } | null } };


import { TypedDocumentNode } from '@apollo/client/core';
export const UpdateWorkspaceDocument = (import("graphql").DocumentNode) as TypedDocumentNode<UpdateWorkspaceMutation, UpdateWorkspaceMutationVariables>;
export default UpdateWorkspaceDocument 