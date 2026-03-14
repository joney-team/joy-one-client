"use client";

import { Errored } from "@/components/errored";
import { NavigationTabs } from "@/components/navigation-tabs";
import { EventType, ProductType } from "@/graphql/enums.graphql";
import { useRouter } from "@/hooks/use-router";
import { t } from "@lingui/core/macro";
import { Skeleton, Stack } from "@mantine/core";
import { IconPackage, IconSettings } from "@tabler/icons-react";
import { FC, Fragment, PropsWithChildren } from "react";
import { useRestQuery } from "../apis/use-rest-query";
import { ProductCombosOnboarding } from "./product-combos-onboarding";

export const ProductComboLayout: FC<PropsWithChildren> = (props) => {
  const router = useRouter();

  const checkCombos = useRestQuery({
    route: "/products",
    params: {
      limit: 1,
      type: ProductType.Combo,
    },
    refetchEvents: [EventType.ProductNew, EventType.ProductUpdate, EventType.ProductArchived],
  });

  if (checkCombos.isFetching)
    return (
      <Stack p={16}>
        <Skeleton height={150} />
      </Stack>
    );

  if (checkCombos.error || !checkCombos.data)
    return (
      <Stack p={16}>
        <Errored error={checkCombos.error} centered />
      </Stack>
    );

  const isHasCombos = checkCombos.data.count > 0;

  if (!isHasCombos) {
    return (
      <Stack p={16}>
        <ProductCombosOnboarding />
      </Stack>
    );
  }

  return (
    <Fragment>
      <NavigationTabs
        activeTab={router.pathname.includes("setup") ? "setup" : "combos"}
        tabs={[
          {
            id: "combos",
            name: t`Combos`,
            icon: IconPackage,
          },
          {
            id: "setup",
            name: t`Configuration`,
            icon: IconSettings,
          },
        ]}
        onChange={(tab) => {
          if (tab === "setup") {
            router.push("/combos/setup");
          } else {
            router.push("/combos");
          }
        }}
      />

      {props.children}
    </Fragment>
  );
};
