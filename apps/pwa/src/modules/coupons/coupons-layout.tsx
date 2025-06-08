import { useRouter } from "@/hooks/use-router";
import { t } from "@/modules/lang/lang-service";
import { em, Stack, Tabs } from "@mantine/core";
import { type FC, type PropsWithChildren } from "react";

export const CouponsLayout: FC<PropsWithChildren> = (props) => {
  const router = useRouter();

  return (
    <Stack>
      <Tabs value={router.pathname} onChange={(p) => router.replace(p!)}>
        <Tabs.List>
          <Tabs.Tab fz={em(14)} value="/coupons">
            {t("coupons")}
          </Tabs.Tab>

          <Tabs.Tab fz={em(14)} value="/coupons/rules">
            {t("coupon_rules")}
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {props.children}
    </Stack>
  );
};
