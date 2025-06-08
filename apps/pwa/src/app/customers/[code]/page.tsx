import { AppPageMetadata } from "@/types";
import { MainServerRequest } from "@/modules/requests/main.server-request";
import { combineMetadata } from "@/utils/metadata.utils";
import Content from "./page-content";

export const generateMetadata = combineMetadata({
  fetch: async ({ params }) => MainServerRequest.get<AppPageMetadata>(`/customers/metadata/${params.code}`),
});

export default () => <Content />;
