import { AppMetadata } from "@/graphql/types.graphql";

export const defaultAppMetadata: AppMetadata = {
  __typename: "AppMetadata",
  color: "primary",
  icon: "/favicon.ico",
  name: "JoyOne",
  colorShape: null,
  workspaceId: null,
  isExtended: false,
};
