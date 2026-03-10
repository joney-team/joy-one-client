"use client";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import environment from "@joy-one-client/config";

const httpLink = new HttpLink({ uri: environment.API_SERVER_SIDE_URL + "/graphql" });

export const apolloServer = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
