"use client";

import { Circle } from "@/components/circle";
import { List } from "@/components/list";
import { DateTimeColumn } from "@/components/list/columns/date-time-column";
import { EnumColumn } from "@/components/list/columns/enum-column";
import { Selector } from "@/components/selector";
import { onActionLoad } from "@/utils/actions";
import { t } from "@lingui/core/macro";
import { Badge, Combobox, Group, Stack, Text, Tooltip } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import { api } from "../apis";
import { EventType } from "../events/event-types";
import { WorkspacePermission } from "../workspace-roles/workspace-roles-types";
import { OnPromotionModal } from "./modals/modal-promotion";
import { promotionStatuses, promotionTypes } from "./promotions-constants";
import {
  promotionDescription,
  promotionTermsOfUseCustomerLimit,
  promotionTermsOfUseExpireAt,
} from "./promotions-service";
import { PromotionEntity, PromotionStatus, PromotionType } from "./promotions-types";

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
                  <Text>{promotionDescription(promotion)}</Text>
                </Group>
              );
            },
          }),
          value: {
            name: t`Terms of use`,
            render: ({ data: promotion }) => {
              return (
                <Stack gap={5}>
                  <Group>• {promotionTermsOfUseCustomerLimit(promotion)}</Group>
                  <Group>• {promotionTermsOfUseExpireAt(promotion)}</Group>
                </Stack>
              );
            },
          },
          expireAt: DateTimeColumn({ name: t`Expire at`, defaultHidden: true, sortable: true }),
          status: EnumColumn<PromotionStatus>({
            w: 200,
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
                        process: () =>
                          api.patch(`/promotions/${promotion.id}/status`, {
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
        events={[
          EventType.PROMOTION_NEW,
          EventType.PROMOTION_UPDATED,
          EventType.PROMOTION_ARCHIVED,
        ]}
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
