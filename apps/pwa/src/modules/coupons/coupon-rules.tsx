import { ButtonPlus } from "@/components/buttons/button-plus";
import { Empty } from "@/components/empty";
import { OnModalCouponRuleForm } from "@/modules/coupons/modals/modal-coupon-rule-form";
import { getCouponRules } from "@/modules/coupons/coupon-service";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { num, tl } from "@/modules/lang/lang-service";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useList } from "@/components/list/use-list";
import { Badge, em, Group, SimpleGrid, Skeleton, Stack } from "@mantine/core";
import { FC } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { CouponRuleCard } from "./coupon-rule-card";

export const CouponRules: FC = () => {
  const rules = useList({
    id: "coupon-rules",
    limit: 50,
    fetch: async (q) => getCouponRules(q),
  });

  useEventsListener(
    [
      EventType.COUPON_RULES_ARCHIVED,
      EventType.COUPON_RULES_CREATED,
      EventType.COUPON_RULES_UPDATED,
    ],
    () => rules.fetch(true)
  );

  return (
    <InfiniteScroll loadMore={() => rules.fetch()} hasMore={rules.isAbleToLoadMore}>
      <Stack>
        <Group gap={10}>
          <ButtonPlus
            onClick={() => OnModalCouponRuleForm()}
            permission={WorkspacePermission.COUPONS_MANAGER}
          />

          <Badge variant="light" size="xl" fz={em(12)} style={{ borderRadius: 100 }}>
            {tl("qty")}
            {rules.isInitialized && `: ${num(rules.count)}`}
          </Badge>
        </Group>

        {rules.isHasData && (
          <SimpleGrid cols={{ md: 3 }}>
            {rules.data.map((item) => {
              return <CouponRuleCard key={item._id} rule={item} />;
            })}
          </SimpleGrid>
        )}

        {rules.isFetching && (
          <SimpleGrid cols={{ md: 3 }}>
            <Skeleton height={150} />
            <Skeleton height={150} />
            <Skeleton height={150} />
          </SimpleGrid>
        )}

        <Empty visible={rules.isEmpty} />
      </Stack>
    </InfiniteScroll>
  );
};
