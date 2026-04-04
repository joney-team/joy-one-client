"use client";

import { ButtonPlus } from "@/components/buttons/button-plus";
import { Empty } from "@/components/empty";
import { NumberFormat } from "@/components/format/number-format";
import { EventType } from "@/graphql/enums.graphql";
import { useEventsListener } from "@/modules/events/event-service";
import { OnModalPrescriptionForm } from "@/modules/prescriptions/modals/modal-prescription-form";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useQuery } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
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
import GetPrescriptionsDocument from "./graphql/getPrescriptions.graphql";

export const PrescriptionList: FC = () => {
  const { data, loading, refetch } = useQuery(GetPrescriptionsDocument, {
    variables: {
      query: {
        getAll: true,
      },
    },
  });

  useEventsListener(
    [EventType.PrescriptionsNew, EventType.PrescriptionsUpdated, EventType.PrescriptionsRemoved],
    () => refetch(),
  );

  return (
    <Stack p="md">
      <Group gap={8}>
        <ButtonPlus
          onClick={() => OnModalPrescriptionForm({ notUseTemplate: true })}
          permission={WorkspacePermission.PRESCRIPTIONS_WRITE}
        />

        {data && (
          <Badge variant="light" size="xl" fz={em(12)} style={{ borderRadius: 100 }}>
            <Trans>QTY</Trans>
            {": "}
            <NumberFormat value={data?.list.total} />
          </Badge>
        )}
      </Group>

      {data && data?.list.total > 0 && (
        <SimpleGrid cols={{ md: 3 }}>
          {data.list.results.map((prescription) => {
            const totalDays = prescription.items.reduce((acc, item) => Math.max(acc, item.days), 0);

            return (
              <Card
                key={prescription._id}
                p="md"
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
                        • <Trans>Pill</Trans>: {prescription.items.length}
                      </Text>
                      <Text fz={em(12)}>
                        • <Trans>Days number</Trans>: {totalDays}{" "}
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

      {loading && !data && <Skeleton height={150} />}
      <Empty visible={data?.list.total === 0} />
    </Stack>
  );
};
