import type * as Types from '../../../graphql/types.graphql.d';

export type SearchQueryVariables = Types.Exact<{
  query: Types.Scalars['String']['input'];
  entities: Array<Types.Scalars['String']['input']>;
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type SearchQuery = { __typename: 'Query', search: Array<
    | { __typename: 'SearchResultCategory', name: string, id: string, entity: string }
    | { __typename: 'SearchResultCustomer', name: string, code: string, phone: string | null, id: string, entity: string }
    | { __typename: 'SearchResultLoan', code: string, customerName: string, customerPhone: string | null, id: string, entity: string }
    | { __typename: 'SearchResultOrders', code: string, id: string, entity: string }
    | { __typename: 'SearchResultPartner', name: string, phone: string | null, id: string, entity: string }
    | { __typename: 'SearchResultPrescriptions', name: string, note: string, id: string, entity: string }
    | { __typename: 'SearchResultProduct', name: string, id: string, entity: string }
    | { __typename: 'SearchResultReceipt', code: string, id: string, entity: string }
    | { __typename: 'SearchResultTags', name: string, type: string, id: string, entity: string }
    | { __typename: 'SearchResultTask', name: string, code: string, id: string, entity: string }
    | { __typename: 'SearchResultWorkspaceMember', name: string, email: string, avatar: string | null, phone: string | null, color: string | null, userId: string, memberId: string | null, id: string, entity: string }
  > };

declare const Document: import("graphql").DocumentNode; export default Document;