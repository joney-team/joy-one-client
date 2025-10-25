import { useRouter } from "@/hooks/use-router";
import { tl } from "@/modules/lang/lang-service";
import { em, Stack, Tabs } from "@mantine/core";
import { type FC, type PropsWithChildren } from "react";

export const CouponsLayout: FC<PropsWithChildren> = (props) => {
  const router = useRouter();

  return (
    <Stack>
      <Tabs value={router.pathname} onChange={(p) => router.replace(p!)}>
        <Tabs.List>
          <Tabs.Tab fz={em(14)} value="/coupons">
            {tl("coupons")}
          </Tabs.Tab>

          <Tabs.Tab fz={em(14)} value="/coupons/rules">
            {tl("coupon_rules")}
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {props.children}
    </Stack>
  );
};
