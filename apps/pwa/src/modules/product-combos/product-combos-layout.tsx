"use client";

import { Errored } from "@/components/errored";
import { NavigationTabs } from "@/components/navigation-tabs";
import { useRouter } from "@/hooks/use-router";
import { EventType } from "@/modules/events/event-types";
import { ProductType } from "@/modules/products/products-types";
import { Skeleton, Stack } from "@mantine/core";
import { IconPackage, IconSettings } from "@tabler/icons-react";
import { FC, Fragment, PropsWithChildren } from "react";
import { useQuery } from "../apis/use-query";
import { ProductCombosOnboarding } from "./product-combos-onboarding";

export const ProductComboLayout: FC<PropsWithChildren> = (props) => {
  const router = useRouter();

  const checkCombos = useQuery({
    route: "/products",
    params: {
      limit: 1,
      type: ProductType.COMBO,
    },
    refetchEvents: [EventType.PRODUCT_NEW, EventType.PRODUCT_UPDATE, EventType.PRODUCT_ARCHIVED],
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
            name: "combos",
            icon: IconPackage,
          },
          {
            id: "setup",
            name: "configuration",
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
