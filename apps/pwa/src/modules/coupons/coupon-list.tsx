"use client";

import { ButtonPlus } from "@/components/buttons/button-plus";
import { Empty } from "@/components/empty";
import { NumberFormat } from "@/components/format/number-format";
import { useList } from "@/components/list/use-list";
import { getCoupons } from "@/modules/coupons/coupon-service";
import { ModalCouponForm } from "@/modules/coupons/modals/modal-coupon-form";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { Trans } from "@lingui/react/macro";
import { Badge, em, Group, SimpleGrid, Skeleton, Stack } from "@mantine/core";
import { type FC } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { CouponCard } from "./coupon-card";

export const CouponList: FC = () => {
  const coupons = useList({
    id: "coupons",
    limit: 50,
    fetch: async (q) => getCoupons(q),
  });

  useEventsListener(
    [
      EventType.COUPON_RULES_ARCHIVED,
      EventType.COUPON_RULES_CREATED,
      EventType.COUPON_RULES_UPDATED,
      EventType.COUPONS_CREATED,
      EventType.COUPONS_USED,
    ],
    () => coupons.fetch(true)
  );

  return (
    <InfiniteScroll loadMore={() => coupons.fetch()} hasMore={coupons.isAbleToLoadMore}>
      <Stack>
        <Group gap={10}>
          <ModalCouponForm>
            {(open) => (
              <ButtonPlus onClick={() => open()} permission={WorkspacePermission.COUPONS_MANAGER} />
            )}
          </ModalCouponForm>

          <Badge variant="light" size="xl" fz={em(12)} style={{ borderRadius: 100 }}>
            <Trans>QTY</Trans>
            {": "}
            {coupons.isInitialized && <NumberFormat value={coupons.count} />}
          </Badge>
        </Group>

        {coupons.isHasData && (
          <SimpleGrid cols={{ md: 3 }}>
            {coupons.data.map((item) => {
              return <CouponCard key={item._id} coupon={item} />;
            })}
          </SimpleGrid>
        )}

        {coupons.isFetching && (
          <SimpleGrid cols={{ md: 3 }}>
            <Skeleton height={150} />
            <Skeleton height={150} />
            <Skeleton height={150} />
          </SimpleGrid>
        )}

        {coupons.isEmpty && <Empty />}
      </Stack>
    </InfiniteScroll>
  );
};
