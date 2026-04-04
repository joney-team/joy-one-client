"use client";

import { Circle } from "@/components/circle";
import { DateFormat } from "@/components/format/date-format";
import { List } from "@/components/list";
import { dateTimeColumn } from "@/components/list/columns/date-time-column";
import { enumColumn } from "@/components/list/columns/enum-column";
import { Selector } from "@/components/selector";
import { EventType, PromotionStatus, PromotionType } from "@/graphql/enums.graphql";
import { DynamicSelectionOperator } from "@/types";
import { onActionLoad } from "@/utils/actions";
import { Trans, useLingui } from "@lingui/react/macro";
import { Badge, Combobox, Group, Stack, Text, Tooltip } from "@mantine/core";
import { IconCheck, IconEdit } from "@tabler/icons-react";
import { Fragment } from "react";
import { WorkspacePermission } from "../workspace-roles/workspace-roles-types";
import { PromotionDescription } from "./components/promotion-description";
import { OnPromotionModal } from "./modals/modal-promotion";
import { promotionStatuses, promotionTypes } from "./promotions-constants";

import { useApolloClient } from "@apollo/client/react";
import { PromotionFragment } from "./graphql/fragmentPromotion.graphql";
import GetPromotionsDocument from "./graphql/getPromotions.graphql";
import UpdatePromotionStatusDocument from "./graphql/updatePromotionStatus.graphql";

export const PromotionsList = () => {
  const client = useApolloClient();
  const { t } = useLingui();

  return (
    <Stack p="md">
      <List<PromotionFragment>
        id="prs"
        query={GetPromotionsDocument}
        name={<Trans>Promotions</Trans>}
        columns={{
          name: {
            name: <Trans>Name</Trans>,
            defaultWidth: 350,
          },
          type: enumColumn<PromotionType>({
            defaultWidth: 400,
            name: <Trans>Type</Trans>,
            options: Object.values(PromotionType).map((type) => ({
              value: type,
              label: t(promotionTypes[type].label),
            })),
            render: ({ data: promotion }) => {
              const promotionType = promotionTypes[promotion.type as PromotionType];
              if (!promotionType)
                return (
                  <Badge color="gray" variant="light">
                    <Trans>Unknown</Trans>
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
            name: <Trans>Terms of use</Trans>,
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
            name: <Trans>Expire at</Trans>,
            defaultHidden: true,
            sortable: true,
          }),
          status: enumColumn<PromotionStatus>({
            name: <Trans>Status</Trans>,
            defaultWidth: 200,
            options: Object.values(PromotionStatus).map((status) => ({
              value: status,
              label: t(promotionStatuses[status].label),
              color: promotionStatuses[status].color,
            })),
            render: ({ data: promotion }) => {
              const isEditable = !promotion.expireAt || promotion.expireAt === 0;

              return (
                <Tooltip
                  label={
                    isEditable ? (
                      <Trans>Click to change status</Trans>
                    ) : (
                      <Trans>Promotion status not editable</Trans>
                    )
                  }
                >
                  <Selector
                    disabled={!isEditable}
                    staticSearch
                    pinnedOptions={[PromotionStatus.Active, PromotionStatus.Closed].map(
                      (status) => ({
                        id: status,
                        label: t(promotionStatuses[status].label),
                      }),
                    )}
                    onSelect={(value) => {
                      onActionLoad({
                        name: <Trans>Update promotion status</Trans>,
                        icon: IconCheck,
                        process: () =>
                          client.mutate({
                            mutation: UpdatePromotionStatusDocument,
                            variables: {
                              promotionId: promotion.id,
                              status: value?.id as PromotionStatus,
                            },
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
                              <Text>
                                <Trans>Unknown</Trans>
                              </Text>
                            </Group>
                          </Combobox.Option>
                        );

                      return (
                        <Combobox.Option value={option.id} key={option.id}>
                          <Group gap={8}>
                            <Circle color={status.color} size={12} />
                            <Text>{t(status.label)}</Text>
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
                            <Trans>Unknown</Trans>
                          </Badge>
                        );

                      return (
                        <Badge
                          onClick={ctx.toggle}
                          color={status.color}
                          className={isEditable ? "clickable" : "unclickable"}
                        >
                          {t(status.label)}
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
            label: <Trans>Edit</Trans>,
            icon: IconEdit,
            onClick: (promotion) => OnPromotionModal({ promotion }),
          },
        ]}
      />
    </Stack>
  );
};
