import { restServerClient } from "@/modules/apis/rest-server";
import { combineMetadata } from "@/utils/metadata.utils";
import { NextPage } from "next";
import Content from "./content";

export const generateMetadata = combineMetadata({
  fetch: async ({ params }) =>
    restServerClient.get(`/workspaces/invite/${params.inviteCode}/metadata`),
});

const Page: NextPage = () => {
  return <Content />;
};

export default Page;
