"use client";

import { Circle } from "@/components/circle";
import { DateFormat } from "@/components/format/date-format";
import { List } from "@/components/list";
import { dateTimeColumn } from "@/components/list/columns/date-time-column";
import { enumColumn } from "@/components/list/columns/enum-column";
import { Selector } from "@/components/selector";
import { DynamicSelectionOperator } from "@/types";
import { onActionLoad } from "@/utils/actions";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Badge, Combobox, Group, Stack, Text, Tooltip } from "@mantine/core";
import { IconCheck, IconEdit } from "@tabler/icons-react";
import { Fragment } from "react";
import { apiClient } from "../apis";
import { EventType } from "@/graphql/enums.graphql";
import { WorkspacePermission } from "../workspace-roles/workspace-roles-types";
import { PromotionDescription } from "./components/promotion-description";
import { OnPromotionModal } from "./modals/modal-promotion";
import { promotionStatuses, promotionTypes } from "./promotions-constants";
import { PromotionEntity, PromotionStatus, PromotionType } from "./promotions-types";

import QUERY_PROMOTIONS from "./graphql/queryPromotions.graphql";

export const PromotionsList = () => {
  return (
    <Stack p={16}>
      <List<PromotionEntity>
        id="prs"
        query={QUERY_PROMOTIONS}
        name={<Trans>Promotions</Trans>}
        columns={{
          name: {
            name: t`Name`,
            defaultWidth: 350,
          },
          type: enumColumn<PromotionType>({
            defaultWidth: 400,
            name: t`Type`,
            options: Object.values(PromotionType).map((type) => ({
              value: type,
              label: promotionTypes[type].label(),
            })),
            render: ({ data: promotion }) => {
              const promotionType = promotionTypes[promotion.type as PromotionType];
              if (!promotionType)
                return (
                  <Badge color="gray" variant="light">
                    {t`Unknown`}
                  </Badge>
                );

              return (
                <Group gap={8} variant="light" wrap="nowrap">
                  <Circle color={promotionType.color} size={12} />
                  <Text>
                    <PromotionDescription promotion={promotion} />
                  </Text>
                </Group>
              );
            },
          }),
          value: {
            defaultWidth: 400,
            name: t`Terms of use`,
            render: ({ data: promotion }) => {
              return (
                <Stack gap={5}>
                  <Group>
                    •{" "}
                    {(function () {
                      if (
                        !promotion.customersSelection ||
                        promotion.customersSelection.value.length === 0
                      ) {
                        return <Trans>Unlimited customers</Trans>;
                      }

                      if (
                        promotion.customersSelection.operator === DynamicSelectionOperator.INCLUDES
                      ) {
                        return (
                          <Fragment>
                            <Trans>Includes customers</Trans>:{" "}
                            {promotion.customersSelection.value.map((c) => c.name).join(", ")}
                          </Fragment>
                        );
                      }

                      if (
                        promotion.customersSelection.operator === DynamicSelectionOperator.EXCLUDES
                      ) {
                        return (
                          <Fragment>
                            <Trans>Excludes customers</Trans>:{" "}
                            {promotion.customersSelection.value.map((c) => c.name).join(", ")}
                          </Fragment>
                        );
                      }
                    })()}
                  </Group>
                  {promotion.expireAt && (
                    <Group>
                      •<Trans>Expire at</Trans>:{" "}
                      <DateFormat value={promotion.expireAt} type="date-time" />
                    </Group>
                  )}
                </Stack>
              );
            },
          },
          expireAt: dateTimeColumn({
            name: t`Expire at`,
            defaultHidden: true,
            sortable: true,
          }),
          status: enumColumn<PromotionStatus>({
            name: t`Status`,
            defaultWidth: 200,
            options: Object.values(PromotionStatus).map((status) => ({
              value: status,
              label: promotionStatuses[status].label(),
              color: promotionStatuses[status].color,
            })),
            render: ({ data: promotion }) => {
              const isEditable = !promotion.expireAt || promotion.expireAt === 0;

              return (
                <Tooltip
                  label={isEditable ? t`Click to change status` : t`Promotion status not editable`}
                >
                  <Selector
                    disabled={isEditable}
                    staticSearch
                    pinnedOptions={[PromotionStatus.ACTIVE, PromotionStatus.CLOSED].map(
                      (status) => ({
                        id: status,
                        label: promotionStatuses[status].label(),
                      })
                    )}
                    onSelect={(value) => {
                      onActionLoad({
                        name: <Trans>Update promotion status</Trans>,
                        icon: IconCheck,
                        process: () =>
                          apiClient.patch(`/promotions/${promotion.id}/status`, {
                            status: value?.id as PromotionStatus,
                          }),
                      });
                    }}
                    renderOption={(option) => {
                      const status = promotionStatuses[option.id as PromotionStatus];
                      if (!status)
                        return (
                          <Combobox.Option value={option.id} key={option.id}>
                            <Group gap={8}>
                              <Circle color="gray" size={12} />
                              <Text>{t`Unknown`}</Text>
                            </Group>
                          </Combobox.Option>
                        );

                      return (
                        <Combobox.Option value={option.id} key={option.id}>
                          <Group gap={8}>
                            <Circle color={status.color} size={12} />
                            <Text>{status.label()}</Text>
                          </Group>
                        </Combobox.Option>
                      );
                    }}
                    target={(ctx) => {
                      const status = promotionStatuses[promotion.status as PromotionStatus];
                      if (!status)
                        return (
                          <Badge
                            onClick={ctx.toggle}
                            color="gray"
                            className={isEditable ? "clickable" : "unclickable"}
                          >
                            {t`Unknown`}
                          </Badge>
                        );

                      return (
                        <Badge
                          onClick={ctx.toggle}
                          color={status.color}
                          className={isEditable ? "clickable" : "unclickable"}
                        >
                          {status.label()}
                        </Badge>
                      );
                    }}
                  />
                </Tooltip>
              );
            },
          }),
        }}
        creatable={{
          permission: WorkspacePermission.PROMOTIONS_MANAGER,
          onCreate: () => OnPromotionModal({}),
        }}
        events={[EventType.PromotionNew, EventType.PromotionUpdated, EventType.PromotionArchived]}
        actions={[
          {
            label: t`Edit`,
            icon: IconEdit,
            onClick: (promotion) => OnPromotionModal({ promotion }),
          },
        ]}
      />
    </Stack>
  );
};
