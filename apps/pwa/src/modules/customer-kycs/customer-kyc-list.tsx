"use client";

import { ButtonSelect } from "@/components/buttons/button-select";
import { Empty } from "@/components/empty";
import { Errored } from "@/components/errored";
import { NumberFormat } from "@/components/format/number-format";
import { useGraphqlList } from "@/components/list/use-graphql-list";
import { CustomerKycStatus, EventType } from "@/graphql/enums.graphql";
import { CustomerKycCard } from "@/modules/customers/customer-detail/customer-kyc-card";
import { useEventsListener } from "@/modules/events/event-service";
import { Trans, useLingui } from "@lingui/react/macro";
import { Badge, Group, SimpleGrid, Skeleton, Stack } from "@mantine/core";
import { IconAnalyzeFilled } from "@tabler/icons-react";
import { FC } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { customerKycStatuses } from "./customer-kyc-constants";
import { CustomerKycFragment } from "./graphql/fragmentCustomerKyc.graphql";
import GetCustomerKycsDocument from "./graphql/getCustomerKycs.graphql";

export const CustomerKycList: FC = () => {
  const { t } = useLingui();
  const kycs = useGraphqlList<CustomerKycFragment>({
    query: GetCustomerKycsDocument,
    id: "ckys",
  });

  useEventsListener(
    [EventType.CustomerKycApproved, EventType.CustomerKycRejected, EventType.CustomerKycPending],
    () => kycs.refetch(),
  );

  return (
    <InfiniteScroll loadMore={() => kycs.loadMore()} hasMore={kycs.isAbleToLoadMore}>
      <Stack gap="md" p="md">
        <Group gap={5}>
          <ButtonSelect
            label={<Trans>Status</Trans>}
            icon={IconAnalyzeFilled}
            onClear={() => kycs.removeParams(["status"])}
            value={kycs.params.status}
            options={Object.values(CustomerKycStatus).map((status) => ({
              label: t(customerKycStatuses[status].label),
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
            {kycs.data.map((kyc) => {
              return <CustomerKycCard key={kyc._id} kyc={kyc} />;
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
