import { ButtonSelect } from "@/components/buttons/button-select";
import { CustomerKycCard } from "@/modules/customers/components/customer-kyc-card";
import { Empty } from "@/components/empty";
import { Errored } from "@/components/errored";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { num, t } from "@/modules/lang/lang-service";
import { useList } from "@/utils/use-list.util";
import { Badge, Group, SimpleGrid, Skeleton, Stack } from "@mantine/core";
import { IconAnalyzeFilled } from "@tabler/icons-react";
import { FC } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { getCustomerKycs } from "./customer-kycs-service";
import { CustomerKycStatus } from "./customer-kycs-types";

export const CustomerKycList: FC = () => {
  const kycs = useList({
    id: "customerKYCs",
    fetch: (q) => getCustomerKycs(q),
  });

  useEventsListener(
    [
      EventType.CUSTOMER_KYC_APPROVED,
      EventType.CUSTOMER_KYC_REJECTED,
      EventType.CUSTOMER_KYC_PENDING,
    ],
    () => kycs.fetch(true, { isSilient: true })
  );

  return (
    <InfiniteScroll loadMore={() => kycs.fetch()} hasMore={kycs.isAbleToLoadMore}>
      <Stack gap={16} p={16}>
        <Group gap={5}>
          <ButtonSelect
            label="Trạng thái"
            icon={IconAnalyzeFilled}
            onClear={() => kycs.removeQueries(["status"])}
            value={kycs.query.status}
            options={Object.values(CustomerKycStatus).map((status) => ({
              label: t(status.toLowerCase()),
              value: status,
            }))}
            onChange={(tagIds) => kycs.setQuery("status", tagIds)}
          />
        </Group>

        <Group gap={8}>
          <Badge variant="light" style={{ borderRadius: 100 }}>
            {t("qty")}
            {kycs.isInitialized && `: ${num(kycs.count)}`}
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
