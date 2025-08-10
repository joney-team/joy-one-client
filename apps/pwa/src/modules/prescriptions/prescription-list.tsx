"use client";

import { ButtonPlus } from "@/components/buttons/button-plus";
import { Empty } from "@/components/empty";
import { OnModalPrescriptionForm } from "@/modules/prescriptions/modals/modal-prescription-form";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { num, t } from "@/modules/lang/lang-service";
import { getPrescriptions } from "@/modules/prescriptions/prescriptions-service";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { capitalize } from "@/utils/string.utils";
import { useList } from "@/components/list/use-list";
import {
  ActionIcon,
  Badge,
  Card,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  em,
} from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import { type FC } from "react";
import InfiniteScroll from "react-infinite-scroller";

export const PrescriptionList: FC = () => {
  const prescriptions = useList({
    id: "prescriptions",
    fetch: async (q) =>
      getPrescriptions({
        ...q,
      }),
  });

  useEventsListener(
    [EventType.PRESCRIPTIONS_NEW, EventType.PRESCRIPTIONS_UPDATED, EventType.PRESCRIPTIONS_REMOVED],
    () => prescriptions.fetch(true, { isSilient: true })
  );

  return (
    <InfiniteScroll loadMore={() => prescriptions.fetch()} hasMore={prescriptions.isAbleToLoadMore}>
      <Stack p={16}>
        <Group gap={8}>
          <ButtonPlus
            onClick={() => OnModalPrescriptionForm({ notUseTemplate: true })}
            permission={WorkspacePermission.PRESCRIPTIONS_WRITE}
          />

          <Badge variant="light" size="xl" fz={em(12)} style={{ borderRadius: 100 }}>
            {t("qty")}
            {prescriptions.isInitialized && `: ${num(prescriptions.count)}`}
          </Badge>
        </Group>

        {prescriptions.isHasData && (
          <SimpleGrid cols={{ md: 3 }}>
            {prescriptions.data.map((prescription) => {
              const totalDays = prescription.items.reduce(
                (acc, item) => Math.max(acc, item.days),
                0
              );

              return (
                <Card
                  key={prescription._id}
                  p={16}
                  shadow="xs"
                  onClick={() => {
                    OnModalPrescriptionForm({ prescription });
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <Group justify="space-between" align="start">
                    <Stack gap={8}>
                      <Text fw={600}>{prescription.name}</Text>

                      <Stack gap={5}>
                        <Text fz={em(12)}>
                          • {capitalize(t("pill"))}: {prescription.items.length}
                        </Text>
                        <Text fz={em(12)}>
                          • {capitalize(t("days_num"))}: {totalDays}{" "}
                        </Text>
                      </Stack>
                    </Stack>

                    <Group gap={10}>
                      <ActionIcon variant="transparent" color="gray" mt={-5} mr={-5}>
                        <IconEye strokeWidth={1.5} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Card>
              );
            })}
          </SimpleGrid>
        )}

        {prescriptions.isFetching && <Skeleton height={150} />}
        <Empty visible={prescriptions.isEmpty} />
      </Stack>
    </InfiniteScroll>
  );
};
