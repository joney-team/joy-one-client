import { restServerClient } from "@/modules/apis/server";
import { AppPageMetadata } from "@/types";
import { combineMetadata } from "@/utils/metadata.utils";

export const tasksMetadata = combineMetadata({
  fetch: async ({ params }) => {
    if (params.code) {
      return restServerClient.get<AppPageMetadata>(`/tasks/metadata/${params.code}`);
    }

    if (!params.slug || params.slug === "d") {
      return null;
    }

    return restServerClient.get<AppPageMetadata>(`/tags/metadata/${params.slug}`);
  },
});
