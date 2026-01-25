"use client";

import { ButtonSelect } from "@/components/buttons/button-select";
import { Empty } from "@/components/empty";
import { Errored } from "@/components/errored";
import { NumberFormat } from "@/components/format/number-format";
import { useList } from "@/components/list/use-list";
import { EventType } from "@/graphql/enums.graphql";
import { CustomerKycCard } from "@/modules/customers/components/customer-kyc-card";
import { useEventsListener } from "@/modules/events/event-service";
import { Trans } from "@lingui/react/macro";
import { Badge, Group, SimpleGrid, Skeleton, Stack } from "@mantine/core";
import { IconAnalyzeFilled } from "@tabler/icons-react";
import { FC } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { customerKycStatuses } from "./customer-kyc-constants";
import { getCustomerKycs } from "./customer-kycs-service";
import { CustomerKycStatus } from "./customer-kycs-types";

export const CustomerKycList: FC = () => {
  const kycs = useList({
    id: "customerKYCs",
    fetch: (q) => getCustomerKycs(q),
  });

  useEventsListener(
    [EventType.CustomerKycApproved, EventType.CustomerKycRejected, EventType.CustomerKycPending],
    () => kycs.fetch(true, { isSilient: true })
  );

  return (
    <InfiniteScroll loadMore={() => kycs.fetch()} hasMore={kycs.isAbleToLoadMore}>
      <Stack gap={16} p={16}>
        <Group gap={5}>
          <ButtonSelect
            label="Trạng thái"
            icon={IconAnalyzeFilled}
            onClear={() => kycs.removeParams(["status"])}
            value={kycs.params.status}
            options={Object.values(CustomerKycStatus).map((status) => ({
              label: customerKycStatuses[status].label(),
              value: status,
            }))}
            onChange={(tagIds) => kycs.setParams({ status: tagIds })}
          />
        </Group>

        <Group gap={8}>
          <Badge variant="light" style={{ borderRadius: 100 }}>
            <Trans>QTY</Trans>
            {": "}
            {kycs.isInitialized && <NumberFormat value={kycs.count} />}
          </Badge>
        </Group>

        <Empty visible={kycs.isEmpty} />
        <Errored visible={kycs.isHasError} error={kycs.error} />

        {kycs.isHasData && (
          <SimpleGrid cols={{ md: 3 }}>
            {kycs.data.map((product) => {
              return <CustomerKycCard key={product._id} kyc={product} />;
            })}
          </SimpleGrid>
        )}

        {kycs.isFetching && (
          <SimpleGrid cols={{ md: 3 }}>
            <Skeleton height={115} />
            <Skeleton height={115} />
            <Skeleton height={115} />
          </SimpleGrid>
        )}
      </Stack>
    </InfiniteScroll>
  );
};
