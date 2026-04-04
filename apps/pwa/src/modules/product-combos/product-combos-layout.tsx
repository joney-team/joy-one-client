"use client";

import { Errored } from "@/components/errored";
import { NavigationTabs } from "@/components/navigation-tabs";
import { EventType, ProductType } from "@/graphql/enums.graphql";
import { useRouter } from "@/hooks/use-router";
import { useQuery } from "@apollo/client/react";
import { t } from "@lingui/core/macro";
import { Skeleton, Stack } from "@mantine/core";
import { IconPackage, IconSettings } from "@tabler/icons-react";
import { FC, Fragment, PropsWithChildren } from "react";
import { useEventsListener } from "../events/event-service";
import GetProductsDocument from "../products/graphql/getProducts.graphql";
import { ProductCombosOnboarding } from "./product-combos-onboarding";

export const ProductComboLayout: FC<PropsWithChildren> = (props) => {
  const router = useRouter();

  const { data, loading, error, refetch } = useQuery(GetProductsDocument, {
    variables: {
      limit: 1,
      query: {
        type: ProductType.Combo,
      },
    },
    fetchPolicy: "cache-and-network",
  });

  useEventsListener(
    [EventType.ProductNew, EventType.ProductUpdate, EventType.ProductArchived],
    () => refetch(),
  );

  if (loading && !data)
    return (
      <Stack p="md">
        <Skeleton height={150} />
      </Stack>
    );

  if (error || !data)
    return (
      <Stack p="md">
        <Errored error={error} centered />
      </Stack>
    );

  const isHasCombos = data.list.total > 0;

  if (!isHasCombos) {
    return (
      <Stack p="md">
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
