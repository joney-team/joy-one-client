import type * as Types from '../../../graphql/types.graphql.d';

export type EInvoicesQueryVariables = Types.Exact<{
  limit?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  offset?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  query?: Types.InputMaybe<Types.Scalars['JSONObject']['input']>;
}>;


export type EInvoicesQuery = { __typename: 'Query', list: { __typename: 'PluginEInvoicesPaginated', total: number, results: Array<{ __typename: 'EInvoice', _id: string, refs: Array<string> | null, createdAt: number | null, updatedAt: number | null, providerId: string, provider: Types.PluginEInvoicesProviderType, receiptId: string, receiptCode: string, invoiceId: string, invoiceData: any | null, providerData: any | null, url: string | null, isCancelled: boolean | null }> } };


import { TypedDocumentNode } from '@apollo/client/core';
export const EInvoicesDocument = (import("graphql").DocumentNode) as TypedDocumentNode<EInvoicesQuery, EInvoicesQueryVariables>;
export default EInvoicesDocument 