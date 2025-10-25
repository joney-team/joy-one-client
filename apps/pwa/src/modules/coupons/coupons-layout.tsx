import { useRouter } from "@/hooks/use-router";
import { Trans } from "@lingui/react/macro";
import { em, Stack, Tabs } from "@mantine/core";
import { type FC, type PropsWithChildren } from "react";

export const CouponsLayout: FC<PropsWithChildren> = (props) => {
  const router = useRouter();

  return (
    <Stack>
      <Tabs value={router.pathname} onChange={(p) => router.replace(p!)}>
        <Tabs.List>
          <Tabs.Tab fz={em(14)} value="/coupons">
            <Trans>Coupons</Trans>
          </Tabs.Tab>

          <Tabs.Tab fz={em(14)} value="/coupons/rules">
            <Trans>Coupon rules</Trans>
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {props.children}
    </Stack>
  );
};
