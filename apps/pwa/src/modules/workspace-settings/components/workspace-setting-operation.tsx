"use client";

import { Badge } from "@/components/badge";
import { Button } from "@/components/buttons/button";
import { FormSession } from "@/components/form-session";
import { appEntities } from "@/constant";
import { EventType, ReceiptPaymentMethod } from "@/graphql/enums.graphql";
import { WorkingDayInterval } from "@/graphql/types.graphql";
import { AttendanceSetting } from "@/modules/attendance/attendance-setting";
import { useLang } from "@/modules/lang/lang-context";
import { receiptPaymentMethods } from "@/modules/receipts/receipt-constants";
import { searchGetAvailableEntities } from "@/modules/search/search-service";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useFetch } from "@/utils/use-fetch.util";
import { Currency } from "@joy-one/utils/currency";
import { renderWeekdayFromISO } from "@joy-one/utils/date-time-render";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  Card,
  Divider,
  Group,
  InputWrapper,
  NumberInput,
  Select,
  SimpleGrid,
  Space,
  Stack,
  Switch,
  Text,
  em,
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { IconPencil, IconPlus } from "@tabler/icons-react";
import { FC, useMemo, useRef } from "react";
import { useWorkspaceSetting } from "../hooks/use-workspace-setting";
import {
  type ModalWorkspaceSettingWorkingDaysRef,
  ModalWorkspaceSettingWorkingDays,
} from "../modals/modal-workspace-setting-working-days";

export const slotGroupColors = ["primary", "orange", "teal"];

export const WorkspaceOperationSettings: FC = () => {
  const { t } = useLingui();
  const { locale } = useLang();
  const workspace = useWorkspace();
  const workspaceSettingWorkingDaysRef = useRef<ModalWorkspaceSettingWorkingDaysRef>(null);
  const { workspaceSetting, updateWorkspaceSetting } = useWorkspaceSetting();

  const searchAvailableEntities = useFetch({
    id: "search-available-entities",
    fetch: async () => searchGetAvailableEntities(),
    refetchEvents: [EventType.WorkspaceSettingUpdated],
  });

  const workingDaysIntervals = useMemo(() => {
    return workspaceSetting?.schedule?.workingDays ?? [];
  }, [workspaceSetting?.schedule?.workingDays]);

  const groupWorkingDays = useMemo(
    () =>
      workingDaysIntervals.reduce<Record<string, WorkingDayInterval[]>>((output, workingDay) => {
        if (!output[workingDay.day]) {
          output[workingDay.day] = [workingDay];
        } else {
          output[workingDay.day].push(workingDay);
        }

        return output;
      }, {}),
    [workingDaysIntervals],
  );

  return (
    <Stack>
      <FormSession
        title={<Trans>Work schedule</Trans>}
        description={
          <Trans>Work schedule applied to the booking, timekeeping, and other features.</Trans>
        }
      >
        {Object.keys(groupWorkingDays).length > 0 &&
          Object.entries(groupWorkingDays).map(([day, workingDays]) => {
            return (
              <Card withBorder shadow="none" key={day} p="xs">
                <Stack gap={8}>
                  <Stack gap={0}>
                    <Text fz="sm" fw={600} tt="capitalize">
                      {renderWeekdayFromISO(+day, locale)}
                    </Text>
                  </Stack>

                  <Group gap={8}>
                    {workingDays.map((interval) => {
                      return (
                        <Badge key={interval.id} variant="light">
                          {interval.start} - {interval.end}
                        </Badge>
                      );
                    })}
                  </Group>
                </Stack>
              </Card>
            );
          })}

        <Group>
          <Button
            size="xs"
            variant="outline"
            color="gray"
            leftIcon={workingDaysIntervals.length > 0 ? IconPencil : IconPlus}
            onClick={() => workspaceSettingWorkingDaysRef.current?.open()}
          >
            {workingDaysIntervals.length > 0 ? <Trans>Edit</Trans> : <Trans>Add</Trans>}
          </Button>
        </Group>

        <ModalWorkspaceSettingWorkingDays ref={workspaceSettingWorkingDaysRef} />
      </FormSession>

      <Divider opacity={0.5} my={30} />

      <FormSession title={<Trans>Attendance</Trans>}>
        <AttendanceSetting />
      </FormSession>

      <Divider opacity={0.5} my={30} />

      <FormSession title={<Trans>Orders</Trans>}>
        <Switch
          label={<Trans>Allow multiple payments (Installment or Deposit)</Trans>}
          defaultChecked={workspaceSetting?.allowPayTicketMultipleTimes ?? false}
          onChange={(e) => {
            updateWorkspaceSetting({
              allowPayTicketMultipleTimes: !!e.target.checked,
            });
          }}
          disabled={!workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS)}
        />
      </FormSession>

      <Divider opacity={0.5} my={30} />

      <FormSession title={<Trans>Payment</Trans>}>
        <Select
          label={<Trans>Currency</Trans>}
          searchable
          value={workspaceSetting?.currencyCode}
          data={Currency.data.map((c) => ({ value: c.code, label: c.name }))}
          onChange={(value) => {
            updateWorkspaceSetting({
              currencyCode: value ?? null,
            });
          }}
        />

        <Select
          label={<Trans>Default payment method</Trans>}
          searchable
          defaultValue={
            workspaceSetting?.receiptPaymentMethodDefault || Object.values(ReceiptPaymentMethod)[0]
          }
          data={Object.values(ReceiptPaymentMethod).map((value) => ({
            value,
            label: t(receiptPaymentMethods[value].label),
          }))}
          onChange={(value) => {
            updateWorkspaceSetting({
              receiptPaymentMethodDefault: value as ReceiptPaymentMethod,
            });
          }}
          disabled={!workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS)}
        />

        <Space h={12} />

        <Switch
          label={<Trans>Receipt images required</Trans>}
          defaultChecked={workspaceSetting?.receiptImagesRequired ?? false}
          onChange={(e) => {
            updateWorkspaceSetting({
              receiptImagesRequired: !!e.target.checked,
            });
          }}
          disabled={!workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS)}
        />

        <Switch
          label={<Trans>Allow tip</Trans>}
          defaultChecked={workspaceSetting?.allowTip ?? false}
          onChange={(e) => {
            updateWorkspaceSetting({
              allowTip: !!e.target.checked,
            });
          }}
          disabled={!workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS)}
        />
      </FormSession>

      <Divider opacity={0.5} my={30} />

      <FormSession title={<Trans>Bookings</Trans>}>
        <Stack gap={5}>
          <Group>
            <NumberInput
              label={<Trans>Remind customers before the appointment n (days)</Trans>}
              defaultValue={workspaceSetting?.bookingsAutoRemindCustomerBookingBeforeDays ?? 0}
              onBlur={(value) => {
                updateWorkspaceSetting({
                  bookingsAutoRemindCustomerBookingBeforeDays: +value || 0,
                });
              }}
            />

            <TimeInput
              label={<Trans>Reminder time</Trans>}
              defaultValue={workspaceSetting?.bookingsAutoRemindCustomerBookingTime ?? ""}
              onBlur={(value) => {
                updateWorkspaceSetting({
                  bookingsAutoRemindCustomerBookingTime: value.target.value,
                });
              }}
            />
          </Group>
          <Text fz={em(12)} c="gray">
            <Trans>
              Leave blank or fill in 0 if you do not want to remind the customer. <br /> The
              reminder will be sent via Zalo OA, SMS and Email if these services are enabled.
            </Trans>
          </Text>
        </Stack>

        <Switch
          label={<Trans>Allow duplicate bookings</Trans>}
          defaultChecked={workspaceSetting?.allowDuplicateBookings ?? false}
          onChange={(e) => {
            updateWorkspaceSetting({
              allowDuplicateBookings: !!e.target.checked,
            });
          }}
          disabled={!workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS)}
        />
      </FormSession>

      <Divider opacity={0.5} my={30} />

      <FormSession title={<Trans>Search</Trans>}>
        <InputWrapper label={<Trans>Available entities to search</Trans>}>
          <Card withBorder p={12} shadow="none" mt={5}>
            <SimpleGrid cols={{ md: 3 }}>
              {searchAvailableEntities.data?.map((e) => {
                const hideEntities = workspaceSetting?.searchSettings?.hideEntities || [];
                const isAvailable = !!!hideEntities.includes(e);
                const toggle = () => {
                  updateWorkspaceSetting({
                    searchSettings: {
                      __typename: "WorkspaceSearchSettings",
                      hideEntities: isAvailable
                        ? [...hideEntities, e]
                        : hideEntities.filter((item) => item !== e),
                    },
                  });
                };

                return (
                  <Switch
                    key={e}
                    label={t(appEntities[e].name)}
                    defaultChecked={isAvailable}
                    onChange={toggle}
                  />
                );
              })}
            </SimpleGrid>
          </Card>
        </InputWrapper>
      </FormSession>
    </Stack>
  );
};
