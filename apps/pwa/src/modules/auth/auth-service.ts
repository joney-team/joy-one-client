import { configs } from "@/configs/layout.config";
import { t } from "@lingui/core/macro";
import { getGlobal } from "../../global";

export const onFacebookLogin = async () => {
  const global = getGlobal();
  const FB = global.FB;
  return new Promise<{ accessToken: string }>((resolve, reject) => {
    FB.login(
      function (response: any) {
        if (!response || !response.authResponse) reject(new Error(t`Failed to connect with Meta.`));
        resolve(response.authResponse);
      },
      {
        scope: configs.metaScope.join(","),
        return_scopes: true,
      },
    );
  });
};
