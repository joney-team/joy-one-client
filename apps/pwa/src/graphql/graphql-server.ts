import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import environment from "@joy-one/config";

const httpLink = new HttpLink({ uri: environment.API_SERVER_SIDE_URL + "/graphql" });

export const graphqlServerClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
