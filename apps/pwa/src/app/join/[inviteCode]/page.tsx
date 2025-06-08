import { getWorkspaceByInviteCode } from "@/modules/workspaces/workspaces-service";
import { combineMetadata } from "@/utils/metadata.utils";
import { NextPage } from "next";
import Content from "./content";

export const generateMetadata = combineMetadata({
  fetch: async ({ params }) => getWorkspaceByInviteCode(params.inviteCode as string),
});

const Page: NextPage = () => {
  return <Content />;
};

export default Page;
