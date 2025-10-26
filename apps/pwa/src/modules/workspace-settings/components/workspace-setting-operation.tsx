"use client";

import { Button } from "@/components/buttons/button";
import { FormSession } from "@/components/form-session";
import { renderSlotTime } from "@/components/inputs/work-slot-settings-input";
import { Renderer } from "@/components/renderer";
import { appEntities } from "@/constant";
import { useLayout } from "@/layout/layout-context";
import { EventType } from "@/modules/events/event-types";
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
import { t } from "@lingui/core/macro";
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
import dayjs from "dayjs";
import { FC } from "react";

export const slotGroupColors = ["primary", "orange", "teal"];

export const WorkspaceOperationSettings: FC = () => {
  const workspace = useWorkspace();
  const layout = useLayout();
  const color = useColor();

  const searchAvailableEntities = useFetch({
    id: "search-available-entities",
    fetch: async () => searchGetAvailableEntities(),
    refetchEvents: [EventType.WORKSPACE_SETTING_UPDATED],
  });

  const workDaySlots = useWorkDaySlots();

  return (
    <Stack py={16}>
      <FormSession
        title={t`Work slots`}
        description={t`Working time slots applied to the booking, timekeeping, and other features.`}
      >
        <Renderer visible={workDaySlots.length > 0}>
          <Group gap={8}>
            {workDaySlots.map((stat) => {
              return (
                <Card withBorder shadow="none" key={stat.dayWeek} p={8}>
                  <Stack gap={8}>
                    <Stack gap={0}>
                      <Text fz={14} fw={600} tt="capitalize">
                        {dayjs().day(stat.dayWeek).format("dddd")}
                      </Text>

                      <Text fz={12} c="gray">
                        {renderSlotTime({
                          ...stat.slots[0],
                          startHour: stat.startHour,
                          startMin: stat.startMin,
                          endHour: stat.endHour,
                          endMin: stat.endMin,
                        })}
                      </Text>
                    </Stack>

                    <Group gap={8}>
                      {stat.slots.map((s) => {
                        const groupId = +(s.groupId || "0");
                        return (
                          <Badge key={s.id} color={color(slotGroupColors[groupId])} variant="light">
                            {renderSlotTime(s)}
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
            fw={500}
            size="compact-md"
            miw={100}
            leftIcon={workDaySlots.length > 0 ? IconPencil : IconPlus}
            iconSpacing={-10}
            iconSize={16}
            fz={13}
            variant="outline"
            onClick={() => OnModalWorkspaceSettingsWorkSlots()}
          >
            {workDaySlots.length > 0 ? t`Edit` : t`Add`}
          </Button>
        </Group>
      </FormSession>

      <Divider opacity={0.5} my={30} />

      <FormSession title={t`Orders`}>
        <Switch
          label={t`Allow multiple payments (Installment or Deposit)`}
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

      <FormSession title={t`Payment`}>
        <Select
          label={t`Currency`}
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
          label={t`Default payment method`}
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
          label={t`Receipt image required`}
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
          label={t`Allow tip`}
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

      <FormSession title={t`Bookings`}>
        <Stack gap={5}>
          <Group>
            <NumberInput
              label={t`Remind customers before the appointment n (days)`}
              defaultValue={workspace.settings.bookingsAutoRemindCustomerBookingBeforeDays}
              onBlur={(value) => {
                setWorkspaceSettings({
                  ...workspace.settings,
                  bookingsAutoRemindCustomerBookingBeforeDays: +value || 0,
                });
              }}
            />

            <TimeInput
              label={t`Reminder time`}
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
            {t`Leave blank or fill in 0 if you do not want to remind the customer. <br /> The reminder will be sent via Zalo OA, SMS and Email if these services are enabled.`}
          </Text>
        </Stack>

        <Switch
          label={t`Allow duplicate bookings`}
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

      <FormSession title={t`Search`}>
        <InputWrapper label={t`Available entities to search`}>
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
                    label={appEntities[e].name()}
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

      <FormSession title={t`Security`}>
        <Switch
          label={t`Require re-login when logging out`}
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
