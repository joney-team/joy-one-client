import { apiServerSide } from "@/modules/apis/server";
import { AppPageMetadata } from "@/types";
import { combineMetadata } from "@/utils/metadata.utils";
import Content from "./page-content";

export const generateMetadata = combineMetadata({
  fetch: async ({ params }) =>
    apiServerSide.get<AppPageMetadata>(`/customers/metadata/${params.code}`),
});

export default () => <Content />;
