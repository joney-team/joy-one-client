"use client";

import { Button } from "@/components/buttons/button";
import { FormSession } from "@/components/form-session";
import { DateFormat } from "@/components/format/date-format";
import { SlotTime } from "@/components/inputs/work-slot-settings-input";
import { Renderer } from "@/components/renderer";
import { appEntities } from "@/constant";
import { EventType } from "@/graphql/enums.graphql";
import { receiptPaymentMethods } from "@/modules/receipts/receipt-constants";
import { ReceiptPaymentMethod } from "@/modules/receipts/receipts-types";
import { searchGetAvailableEntities } from "@/modules/search/search-service";
import { useColor } from "@/modules/theme/use-color";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { OnModalWorkspaceSettingsWorkSlots } from "@/modules/workspace-settings/modals/modal-workspace-setting-work-slots";
import {
  setWorkspaceSettings,
  useWorkDaySlots,
} from "@/modules/workspace-settings/workspace-settings-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useFetch } from "@/utils/use-fetch.util";
import { Currency } from "@joy-one-client/utils/currency";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  Badge,
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
import { FC } from "react";

export const slotGroupColors = ["primary", "orange", "teal"];

export const WorkspaceOperationSettings: FC = () => {
  const { t } = useLingui();
  const workspace = useWorkspace();
  const color = useColor();

  const searchAvailableEntities = useFetch({
    id: "search-available-entities",
    fetch: async () => searchGetAvailableEntities(),
    refetchEvents: [EventType.WorkspaceSettingUpdated],
  });

  const workDaySlots = useWorkDaySlots();

  return (
    <Stack py={16}>
      <FormSession
        title={<Trans>Work slots</Trans>}
        description={
          <Trans>Working time slots applied to the booking, timekeeping, and other features.</Trans>
        }
      >
        <Renderer visible={workDaySlots.length > 0}>
          <Group gap={8}>
            {workDaySlots.map((stat) => {
              return (
                <Card withBorder shadow="none" key={stat.dayWeek} p={8}>
                  <Stack gap={8}>
                    <Stack gap={0}>
                      <Text fz={14} fw={600} tt="capitalize">
                        <DateFormat value={new Date()} type="custom" format={{ weekday: "long" }} />
                      </Text>

                      <Text fz={12} c="gray">
                        <SlotTime
                          dayWeek={stat.dayWeek}
                          startHour={stat.startHour}
                          startMin={stat.startMin}
                          endHour={stat.endHour}
                          endMin={stat.endMin}
                        />
                      </Text>
                    </Stack>

                    <Group gap={8}>
                      {stat.slots.map((s) => {
                        const groupId = +(s.groupId || "0");
                        return (
                          <Badge key={s.id} color={color(slotGroupColors[groupId])} variant="light">
                            <SlotTime
                              dayWeek={s.dayWeek}
                              startHour={s.startHour}
                              startMin={s.startMin}
                              endHour={s.endHour}
                              endMin={s.endMin}
                            />
                          </Badge>
                        );
                      })}
                    </Group>
                  </Stack>
                </Card>
              );
            })}
          </Group>
        </Renderer>

        <Group>
          <Button
            radius={100}
            size="compact-md"
            miw={100}
            leftIcon={workDaySlots.length > 0 ? IconPencil : IconPlus}
            variant="outline"
            onClick={() => OnModalWorkspaceSettingsWorkSlots()}
          >
            {workDaySlots.length > 0 ? <Trans>Edit</Trans> : <Trans>Add</Trans>}
          </Button>
        </Group>
      </FormSession>

      <Divider opacity={0.5} my={30} />

      <FormSession title={<Trans>Orders</Trans>}>
        <Switch
          label={<Trans>Allow multiple payments (Installment or Deposit)</Trans>}
          defaultChecked={workspace.settings.allowPayTicketMultipleTimes}
          onChange={(e) => {
            setWorkspaceSettings({
              ...workspace.settings,
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
          defaultValue={workspace.settings.currencyCode}
          data={Currency.data.map((c) => ({ value: c.code, label: c.name }))}
          onChange={(value) => {
            setWorkspaceSettings({
              ...workspace.settings,
              currencyCode: value || undefined,
            });
          }}
        />

        <Select
          label={<Trans>Default payment method</Trans>}
          searchable
          defaultValue={
            workspace.settings.receiptPaymentMethodDefault || Object.values(ReceiptPaymentMethod)[0]
          }
          data={Object.values(ReceiptPaymentMethod).map((value) => ({
            value,
            label: receiptPaymentMethods[value].label(),
          }))}
          onChange={(value) => {
            setWorkspaceSettings({
              ...workspace.settings,
              receiptPaymentMethodDefault: value as ReceiptPaymentMethod,
            });
          }}
          disabled={!workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS)}
        />

        <Space h={12} />

        <Switch
          label={<Trans>Receipt images required</Trans>}
          defaultChecked={workspace.settings.receiptImagesRequired}
          onChange={(e) => {
            setWorkspaceSettings({
              ...workspace.settings,
              receiptImagesRequired: !!e.target.checked,
            });
          }}
          disabled={!workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS)}
        />

        <Switch
          label={<Trans>Allow tip</Trans>}
          defaultChecked={workspace.settings.allowTip}
          onChange={(e) => {
            setWorkspaceSettings({
              ...workspace.settings,
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
              defaultValue={workspace.settings.bookingsAutoRemindCustomerBookingBeforeDays}
              onBlur={(value) => {
                setWorkspaceSettings({
                  ...workspace.settings,
                  bookingsAutoRemindCustomerBookingBeforeDays: +value || 0,
                });
              }}
            />

            <TimeInput
              label={<Trans>Reminder time</Trans>}
              defaultValue={workspace.settings.bookingsAutoRemindCustomerBookingTime}
              onBlur={(value) => {
                setWorkspaceSettings({
                  ...workspace.settings,
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
          defaultChecked={workspace.settings.allowDuplicateBookings}
          onChange={(e) => {
            setWorkspaceSettings({
              ...workspace.settings,
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
                const hideEntities = workspace.settings.searchSettings?.hideEntities || [];
                const isAvailable = !!!hideEntities.includes(e);
                const toggle = () => {
                  setWorkspaceSettings({
                    ...workspace.settings,
                    searchSettings: {
                      ...workspace.settings.searchSettings,
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

      <Divider opacity={0.5} my={30} />

      <FormSession title={<Trans>Secure</Trans>}>
        <Switch
          label={<Trans>Require re-login when logging out</Trans>}
          defaultChecked={workspace.settings.isAuthSessionRestricted}
          onChange={(e) => {
            setWorkspaceSettings({
              ...workspace.settings,
              isAuthSessionRestricted: !!e.target.checked,
            });
          }}
        />
      </FormSession>
    </Stack>
  );
};
