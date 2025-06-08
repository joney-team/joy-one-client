import { ResponseList } from "@/types";
import { MainRequest } from "@/modules/requests/main.request";
import { PluginMetaPageEntity, PluginMetaPageInfo } from "./meta-pages-types";

export async function getPluginMetaPages() {
  return MainRequest.get<ResponseList<PluginMetaPageEntity>>(`/plugins/meta-pages`);
}

export async function disconnectPluginMetaPage(id: string) {
  return MainRequest.delete(`/plugins/meta-pages/${id}/disconnect`);
}

export async function getPluginMetaPagesInfo(accessToken: string) {
  return MainRequest.get<{ pages: PluginMetaPageInfo[] }>(`/plugins/meta-pages/info`, {
    access_token: accessToken
  });
}