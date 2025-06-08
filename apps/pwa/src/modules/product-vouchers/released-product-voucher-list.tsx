import { Empty } from "@/components/empty";
import { ListQty } from "@/components/list-qty";
import { ProductVoucherCard } from "@/modules/product-vouchers/product-voucher-card";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { getProductVouchers } from "@/modules/product-vouchers/product-vouchers-service";
import { useList } from "@/utils/use-list.util";
import { Group, SimpleGrid, Skeleton, Stack } from "@mantine/core";
import { type FC } from "react";
import InfiniteScroll from "react-infinite-scroller";

export const ReleasedProductVoucherList: FC = () => {
  const productVouchers = useList({
    id: "product-vouchers",
    limit: 100,
    fetch: async (q) =>
      getProductVouchers({
        ...q,
      }),
  });

  useEventsListener([EventType.PRODUCT_VOUCHERS_NEW, EventType.PRODUCT_UPDATE], () => productVouchers.fetch(true));

  return (
    <InfiniteScroll loadMore={() => productVouchers.fetch()} hasMore={productVouchers.isAbleToLoadMore}>
      <Stack>
        <Group gap={8}>
          <ListQty list={productVouchers} />
        </Group>

        {productVouchers.isHasData && (
          <SimpleGrid cols={{ md: 3 }}>
            {productVouchers.data.map((voucher) => {
              return <ProductVoucherCard key={voucher._id} voucher={voucher} />;
            })}
          </SimpleGrid>
        )}

        {productVouchers.isFetching && (
          <SimpleGrid cols={{ md: 3 }}>
            <Skeleton height={150} />
            <Skeleton height={150} />
            <Skeleton height={150} />
          </SimpleGrid>
        )}

        <Empty visible={productVouchers.isEmpty} />
      </Stack>
    </InfiniteScroll>
  );
};
