import { useRouter } from "@/hooks/use-router";
import { Trans } from "@lingui/react/macro";
import { em, Stack, Tabs } from "@mantine/core";
import { FC, PropsWithChildren } from "react";

export const ProductVoucherLayout: FC<PropsWithChildren> = (props) => {
  const router = useRouter();

  return (
    <Stack>
      <Tabs value={router.pathname} onChange={(p) => router.replace(p!)}>
        <Tabs.List>
          <Tabs.Tab tt="capitalize" fz={em(14)} value="/vouchers">
            <Trans>Vouchers</Trans>
          </Tabs.Tab>

          <Tabs.Tab tt="capitalize" fz={em(14)} value="/vouchers/released">
            <Trans>Released vouchers</Trans>
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {props.children}
    </Stack>
  );
};
