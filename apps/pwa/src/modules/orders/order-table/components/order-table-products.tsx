"use client";

import { WayPoint } from "@/components/way-point";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { t } from "@/modules/lang/lang-service";
import { getProductIcon, getProducts } from "@/modules/products/products-service";
import { ProductEntity, ProductType } from "@/modules/products/products-types";
import { useList } from "@/utils/use-list.util";
import { Center, Group, Loader, SimpleGrid, Stack } from "@mantine/core";
import { IconList } from "@tabler/icons-react";
import { FC, Fragment, useEffect, useState } from "react";
import { OrderTableProps } from "..";
import { ProductCard } from "@/modules/products/components/product-card";
import { useOrderTable } from "../order-table-context";
import { OrderTableCtaCard } from "./order-table-cta-card";

export const OrderTableProducts: FC<OrderTableProps> = () => {
  const form = useOrderTable();
  const [filter, setFilter] = useState<{ type?: ProductType; categoryId?: string }>({});

  const products = useList<ProductEntity>({
    autoFetch: false,
    id: "order-table-products",
    fetch: (params) =>
      getProducts({
        sortLastInteractionAt: -1,
        ...filter,
        ...params,
      }),
  });

  useEffect(() => {
    products.fetch(true, { isSilient: true });
  }, [filter]);

  useEventsListener(
    [
      EventType.PRODUCT_NEW,
      EventType.PRODUCT_UPDATE,
      EventType.PRODUCT_ARCHIVED,

      EventType.PRODUCT_STOCK_IN,
      EventType.PRODUCT_STOCK_IN_REVERT,
      EventType.PRODUCT_STOCK_OUT,
      EventType.PRODUCT_STOCK_OUT_REVERT,
      EventType.PRODUCT_STOCK_IN_MULTIPLE,
    ],
    () => {
      products.fetch(true, { isSilient: true });
    },
    [filter]
  );

  return (
    <Fragment>
      <Group gap={8}>
        <OrderTableCtaCard
          label={t("all")}
          icon={IconList}
          onClick={() => setFilter((s) => ({ ...s, type: undefined }))}
          isActive={!filter.type}
        />

        {Object.values(ProductType).map((type) => {
          const Icon = getProductIcon(type);
          const isActive = filter.type === type;

          return (
            <OrderTableCtaCard
              key={type}
              label={t(`product_type_${type}`)}
              icon={Icon}
              onClick={() => setFilter((s) => ({ ...s, type }))}
              isActive={isActive}
            />
          );
        })}
      </Group>

      <Stack>
        {products.isHasData && (
          <SimpleGrid cols={{ md: 3 }}>
            {products.data?.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onClick={() => form.addProduct(product)}
                shadow="xs"
                withBorder={false}
                isHideEdit
                radius={16}
              />
            ))}
          </SimpleGrid>
        )}

        {products.isFetching && (
          <Center>
            <Loader size="sm" type="dots" color="gray" />
          </Center>
        )}

        <WayPoint
          enabled={products.isAbleToLoadMore}
          scrollContainerId="order-table-scroll-container"
          onReached={() => products.fetch(false)}
        />
      </Stack>
    </Fragment>
  );
};
