import type * as Types from '../../../graphql/types.graphql.d';

export type CustomFieldsQueryVariables = Types.Exact<{
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  query?: Types.InputMaybe<Types.Scalars['JSONObject']['input']>;
}>;


export type CustomFieldsQuery = { __typename: 'Query', list: { __typename: 'CustomFieldsPaginated', total: number, results: Array<{ __typename: 'CustomField', refs: Array<string> | null, createdAt: number | null, updatedAt: number | null, _id: string, type: Types.CustomFieldType, key: string | null, label: string, order: number, config: any | null, description: string | null, placeholder: string | null, entities: Array<string>, customFieldValues: Array<{ __typename: 'CustomFieldValue', type: Types.CustomFieldType, key: string | null, config: any | null, customFieldId: string, value: any | null }> | null }> } };


import { TypedDocumentNode } from '@apollo/client/core';
export const CustomFieldsDocument = (import("graphql").DocumentNode) as TypedDocumentNode<CustomFieldsQuery, CustomFieldsQueryVariables>;
export default CustomFieldsDocument 