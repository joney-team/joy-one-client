"use client";

import { ApolloProvider as ApolloProviderApollo } from "@apollo/client/react";
import { apolloClient } from "./apollo-client";

export const ApolloProvider = ({ children }: { children: React.ReactNode }) => {
  return <ApolloProviderApollo client={apolloClient}>{children}</ApolloProviderApollo>;
};
