"use client";

import { ApolloProvider } from "@apollo/client/react";
import { graphqlClient } from "./graphql-client";

export const GraphqlProvider = ({ children }: { children: React.ReactNode }) => {
  return <ApolloProvider client={graphqlClient}>{children}</ApolloProvider>;
};
