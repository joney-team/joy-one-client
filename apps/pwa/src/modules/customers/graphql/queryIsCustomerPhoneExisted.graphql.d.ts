import type * as Types from '../../../graphql/types.graphql.d';

export type IsCustomerPhoneExistedQueryVariables = Types.Exact<{
  phone: Types.Scalars['String']['input'];
}>;


export type IsCustomerPhoneExistedQuery = { __typename: 'Query', isCustomerPhoneExisted: boolean };


import { TypedDocumentNode } from '@apollo/client/core';
export const IsCustomerPhoneExistedDocument = (import("graphql").DocumentNode) as TypedDocumentNode<IsCustomerPhoneExistedQuery, IsCustomerPhoneExistedQueryVariables>;
export default IsCustomerPhoneExistedDocument 