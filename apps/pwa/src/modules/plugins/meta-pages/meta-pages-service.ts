import { ResponseList } from "@/types";
import { PluginMetaPageEntity, PluginMetaPageInfo } from "./meta-pages-types";
import { apiClient } from "@/modules/apis";

export async function getPluginMetaPages() {
  return apiClient.get<ResponseList<PluginMetaPageEntity>>(`/plugins/meta-pages`);
}

export async function disconnectPluginMetaPage(id: string) {
  return apiClient.delete(`/plugins/meta-pages/${id}/disconnect`);
}

export async function getPluginMetaPagesInfo(accessToken: string) {
  return apiClient.get<{ pages: PluginMetaPageInfo[] }>(`/plugins/meta-pages/info`, {
    params: {
      access_token: accessToken,
    },
  });
}
