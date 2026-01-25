import type * as Types from '../../../graphql/types.graphql.d';

export type CustomersQueryVariables = Types.Exact<{
  ids?: Types.InputMaybe<Array<Types.Scalars['String']['input']>>;
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
}>;


export type CustomersQuery = { __typename: 'Query', list: { __typename: 'CustomersPaginated', total: number, results: Array<{ __typename: 'Customer', refs: Array<string> | null, createdAt: number | null, updatedAt: number | null, _id: string, code: string, codePrefix: string | null, plainCode: string | null, name: string, birthday: number | null, birthdayDate: number | null, birthdayMonth: number | null, phone: string | null, avatar: string | null, email: string | null, presenterCustomerId: string | null, gender: Types.Gender | null, medicalHistory: Array<string> | null, assigneeUserIds: Array<string> | null, tagIds: Array<string> | null, salaryAmount: number | null, relatedCustomerIds: Array<string> | null }> } };


import { TypedDocumentNode } from '@apollo/client/core';
export const CustomersDocument = (import("graphql").DocumentNode) as TypedDocumentNode<CustomersQuery, CustomersQueryVariables>;
export default CustomersDocument 