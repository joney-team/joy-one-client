"use client";

import { List } from "@/components/list";
import { Badge, Combobox, Group, Stack, Text, Tooltip } from "@mantine/core";
import React from "react";
import { PromotionEntity, PromotionStatus, PromotionType } from "./promotions-types";
import { OnPromotionModal } from "./modals/modal-promotion";
import { WorkspacePermission } from "../workspace-roles/workspace-roles-types";
import { EventType } from "../events/event-types";
import { IconEdit } from "@tabler/icons-react";
import { num, t } from "@/modules/lang/lang-service";
import {
  promotionDescription,
  promotionRuleTypeConfigs,
  promotionStatusConfigs,
  promotionTermsOfUseCustomerLimit,
  promotionTermsOfUseExpireAt,
} from "./promotions-service";
import { EnumColumn } from "@/components/list/columns/enum-column";
import { Selector } from "@/components/selector";
import { Circle } from "@/components/circle";
import { onActionLoad } from "@/utils/actions";
import { api } from "../apis";
import { DateTimeColumn } from "@/components/list/columns/date-time-column";

export const PromostionList = () => {
  return (
    <Stack p={16}>
      <List<PromotionEntity>
        id="prs"
        route="/promotions"
        columns={{
          name: {},
          type: EnumColumn<PromotionType>({
            w: 400,
            options: Object.values(PromotionType).map((type) => ({
              value: type,
              label: t(promotionRuleTypeConfigs[type].label),
            })),
            render: ({ data: promotion }) => {
              const config = promotionRuleTypeConfigs[promotion.type as PromotionType];
              if (!config)
                return (
                  <Badge color="gray" variant="light">
                    {t("unknown")}
                  </Badge>
                );

              return (
                <Group gap={8} variant="light" wrap="nowrap">
                  <Circle color={config.color} size={12} />
                  <Text>{promotionDescription(promotion)}</Text>
                </Group>
              );
            },
          }),
          value: {
            name: t("terms_of_use"),
            render: ({ data: promotion }) => {
              return (
                <Stack gap={5}>
                  <Group>• {promotionTermsOfUseCustomerLimit(promotion)}</Group>
                  <Group>• {promotionTermsOfUseExpireAt(promotion)}</Group>
                </Stack>
              );
            },
          },
          expireAt: DateTimeColumn({ name: "expireAt", isDefaultHide: true, isSortable: true }),
          status: EnumColumn<PromotionStatus>({
            w: 200,
            options: Object.values(PromotionStatus).map((status) => ({
              value: status,
              label: t(promotionStatusConfigs[status].label),
              color: promotionStatusConfigs[status].color,
            })),
            render: ({ data: promotion }) => {
              const isEditable = !promotion.expireAt || promotion.expireAt === 0;

              return (
                <Tooltip
                  label={t(isEditable ? "click_to_change_status" : "promotion_status_not_editable")}
                >
                  <Selector
                    disabled={isEditable}
                    staticSearch
                    initOptions={[PromotionStatus.ACTIVE, PromotionStatus.CLOSED].map((status) => ({
                      id: status,
                      label: t(promotionStatusConfigs[status].label),
                    }))}
                    onSelect={(value) => {
                      onActionLoad({
                        process: () =>
                          api.patch(`/promotions/${promotion.id}/status`, {
                            status: value?.id as PromotionStatus,
                          }),
                      });
                    }}
                    renderOption={(option) => {
                      const config = promotionStatusConfigs[option.id as PromotionStatus];
                      if (!config)
                        return (
                          <Combobox.Option value={option.id} key={option.id}>
                            <Group gap={8}>
                              <Circle color="gray" size={12} />
                              <Text>{t("unknown")}</Text>
                            </Group>
                          </Combobox.Option>
                        );

                      return (
                        <Combobox.Option value={option.id} key={option.id}>
                          <Group gap={8}>
                            <Circle color={config.color} size={12} />
                            <Text>{t(config.label)}</Text>
                          </Group>
                        </Combobox.Option>
                      );
                    }}
                    target={(ctx) => {
                      const config = promotionStatusConfigs[promotion.status as PromotionStatus];
                      if (!config)
                        return (
                          <Badge
                            onClick={ctx.toggle}
                            color="gray"
                            className={isEditable ? "clickable" : "unclickable"}
                          >
                            {t("unknown")}
                          </Badge>
                        );

                      return (
                        <Badge
                          onClick={ctx.toggle}
                          color={config.color}
                          className={isEditable ? "clickable" : "unclickable"}
                        >
                          {t(config.label)}
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
        events={[
          EventType.PROMOTION_NEW,
          EventType.PROMOTION_UPDATED,
          EventType.PROMOTION_ARCHIVED,
        ]}
        actions={[
          {
            label: t("edit"),
            icon: IconEdit,
            onClick: (promotion) => OnPromotionModal({ promotion }),
          },
        ]}
      />
    </Stack>
  );
};
