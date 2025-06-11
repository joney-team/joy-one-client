import { ResponseList } from "@/types";
import { PluginMetaPageEntity, PluginMetaPageInfo } from "./meta-pages-types";
import { api } from "@/modules/apis";

export async function getPluginMetaPages() {
  return api.get<ResponseList<PluginMetaPageEntity>>(`/plugins/meta-pages`);
}

export async function disconnectPluginMetaPage(id: string) {
  return api.delete(`/plugins/meta-pages/${id}/disconnect`);
}

export async function getPluginMetaPagesInfo(accessToken: string) {
  return api.get<{ pages: PluginMetaPageInfo[] }>(`/plugins/meta-pages/info`, {
    params: {
      access_token: accessToken
    }
  });
}