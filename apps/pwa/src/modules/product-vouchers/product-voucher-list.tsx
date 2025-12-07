import { type FC } from "react";

import { ButtonPlus } from "@/components/buttons/button-plus";
import { Empty } from "@/components/empty";
import { ListQty } from "@/components/list-qty";
import { ProductCard } from "@/modules/products/components/product-card";
import { OnProductModal } from "@/modules/products/modals/modal-product";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/graphql/enums.graphql";
import { getProducts } from "@/modules/products/products-service";
import { ProductType } from "@/modules/products/products-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useList } from "@/components/list/use-list";
import { Group, SimpleGrid, Skeleton, Stack } from "@mantine/core";
import InfiniteScroll from "react-infinite-scroller";

export const ProductVoucherList: FC = () => {
  const vouchers = useList({
    id: "vouchers",
    limit: 50,
    fetch: async (q) => getProducts({ ...q, type: ProductType.VOUCHER }),
  });

  useEventsListener(
    [EventType.ProductArchived, EventType.ProductUpdate, EventType.ProductNew],
    () => vouchers.fetch(true, { isSilient: true })
  );

  return (
    <InfiniteScroll loadMore={() => vouchers.fetch()} hasMore={vouchers.isAbleToLoadMore}>
      <Stack>
        <Group gap={10}>
          <ButtonPlus
            onClick={() => OnProductModal({ type: ProductType.VOUCHER })}
            permission={WorkspacePermission.PRODUCTS_SERVICES_WRITE}
          />

          <ListQty list={vouchers} />
        </Group>

        {vouchers.isHasData && (
          <SimpleGrid cols={{ md: 3 }}>
            {vouchers.data.map((item) => {
              return <ProductCard key={item._id} product={item} />;
            })}
          </SimpleGrid>
        )}

        {vouchers.isFetching && (
          <SimpleGrid cols={{ md: 3 }}>
            <Skeleton height={150} />
            <Skeleton height={150} />
            <Skeleton height={150} />
          </SimpleGrid>
        )}

        <Empty visible={vouchers.isEmpty} />
      </Stack>
    </InfiniteScroll>
  );
};
