import { ResponseList } from "@/types";
import { PluginMetaPageEntity, PluginMetaPageInfo } from "./meta-pages-types";
import { restClient } from "@/modules/apis/rest-client";

export async function getPluginMetaPages() {
  return restClient.get<ResponseList<PluginMetaPageEntity>>(`/plugins/meta-pages`);
}

export async function disconnectPluginMetaPage(id: string) {
  return restClient.delete(`/plugins/meta-pages/${id}/disconnect`);
}

export async function getPluginMetaPagesInfo(accessToken: string) {
  return restClient.get<{ pages: PluginMetaPageInfo[] }>(`/plugins/meta-pages/info`, {
    params: {
      access_token: accessToken,
    },
  });
}
