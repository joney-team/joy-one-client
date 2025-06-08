import { useRouter } from "@/hooks/use-router";
import { t } from "@/modules/lang/lang-service";
import { em, Stack, Tabs } from "@mantine/core";
import { FC, PropsWithChildren } from "react";

export const ProductVoucherLayout: FC<PropsWithChildren> = (props) => {
  const router = useRouter();

  return (
    <Stack>
      <Tabs value={router.pathname} onChange={(p) => router.replace(p!)}>
        <Tabs.List>
          <Tabs.Tab tt="capitalize" fz={em(14)} value="/vouchers">
            {t("vouchers")}
          </Tabs.Tab>

          <Tabs.Tab tt="capitalize" fz={em(14)} value="/vouchers/released">
            {t("customer_vouchers")}
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {props.children}
    </Stack>
  );
};
