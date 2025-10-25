"use client";

import { Button } from "@/components/buttons/button";
import { DateTimeInput } from "@/components/inputs/date-time-input";
import { DynamicSelectionInput } from "@/components/inputs/dynamic-selection-input";
import { ImageInput } from "@/components/inputs/image-input";
import { api } from "@/modules/apis";
import { BuilderCustomFields } from "@/modules/custom-fields/components/builder-custom-fields";
import { CustomField, CustomFieldValue } from "@/modules/custom-fields/custom-field-types";
import { AppEntity, DynamicSelection, DynamicSelectionOperator } from "@/types";
import { onFormError } from "@/utils/exceptions.utils";
import { t } from "@lingui/core/macro";
import { Center, NumberInput, Select, SimpleGrid, Stack, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { type FC } from "react";
import { promotionTypes } from "../promotions-constants";
import { promotionRuleTypeConfigs } from "../promotions-service";
import { PromotionDto, PromotionEntity, PromotionStatus, PromotionType } from "../promotions-types";

export interface FormPromotionProps {
  promotion?: PromotionEntity;
  onSuccess?: () => void;
}

export const FormPromotion: FC<FormPromotionProps> = (props) => {
  const form = useForm<{
    name: string;
    description: string;
    image: string;
    expireAt: number;
    type: PromotionType;
    value: number | null;
    limitPerCustomer?: number;
    productsSelection: DynamicSelection;
    customersSelection: DynamicSelection;
    status: PromotionStatus;
    customFields?: CustomField[];
  }>({
    initialValues: {
      name: props.promotion?.name || "",
      description: props.promotion?.description || "",
      image: props.promotion?.image || "",
      expireAt: props.promotion?.expireAt || 0,
      type: props.promotion?.type || PromotionType.DISCOUNT_RATE,
      value: props.promotion?.value || null,
      limitPerCustomer: props.promotion?.limitPerCustomer,
      productsSelection: props.promotion?.productsSelection || {
        entity: AppEntity.PRODUCTS,
        operator: DynamicSelectionOperator.INCLUDES,
        value: [],
      },
      customersSelection: props.promotion?.customersSelection || {
        entity: AppEntity.CUSTOMERS,
        operator: DynamicSelectionOperator.INCLUDES,
        value: [],
      },
      status: props.promotion?.status || PromotionStatus.ACTIVE,
      customFields: props.promotion?.customFields || [],
    },
    validate: {
      name: (value) => {
        if (!value) return t`Must be provided`;
      },
      value: (value) => {
        if (!value) return t`Must be provided`;
      },
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    try {
      const customFieldValues: CustomFieldValue[] =
        values.customFields?.map((customField) => ({
          customFieldId: customField.customFieldId,
          value: customField.value,
        })) || [];

      const dto: PromotionDto = {
        name: values.name,
        description: values.description,
        image: values.image,
        expireAt: values.expireAt,
        type: values.type,
        value: values.value as number,
        limitPerCustomer: values.limitPerCustomer,
        productsSelection: {
          ...values.productsSelection,
          value: values.productsSelection.value.map((v) => v._id),
        },
        customersSelection: {
          ...values.customersSelection,
          value: values.customersSelection.value.map((v) => v._id),
        },
        customFieldValues,
      };

      let promotion: PromotionEntity | null = null;

      if (props.promotion) {
        promotion = await api.put<PromotionEntity>(`/promotions/${props.promotion.id}`, dto);
      } else {
        promotion = await api.post<PromotionEntity>("/promotions", dto);
      }

      if (promotion) {
        props.onSuccess?.();
      }
    } catch (error) {
      onFormError(form, error);
    }
  });

  const ruleValueConfig = promotionTypes[form.values.type];

  return (
    <form onSubmit={onSubmit}>
      <Stack>
        <TextInput label={t`Name`} {...form.getInputProps("name")} />
        <Textarea label={t`Description`} {...form.getInputProps("description")} />
        <ImageInput label={t`Image`} {...form.getInputProps("image")} h={150} />

        <SimpleGrid cols={2}>
          <Select
            label={t`Type`}
            {...form.getInputProps("type")}
            data={Object.values(PromotionType).map((type) => {
              const config = promotionRuleTypeConfigs[type];
              return {
                value: type,
                label: promotionTypes[type].label(),
              };
            })}
            onChange={(value) => {
              form.setFieldValue("type", value as PromotionType);
              form.setFieldValue("value", null);
            }}
          />

          <NumberInput
            label={ruleValueConfig.label()}
            {...form.getInputProps("value")}
            min={ruleValueConfig.min}
            max={ruleValueConfig.max}
          />
        </SimpleGrid>

        <NumberInput
          label={t`Limit per customer`}
          {...form.getInputProps("limitPerCustomer")}
          placeholder={t`Leave empty if no limit`}
        />

        {/* <DynamicSelectionInput
          label={t("products_limit_rule")}
          description={t("leave_empty_if_no_limit")}
          fixedEntity={AppEntity.PRODUCTS}
          {...form.getInputProps("productsSelection")}
        /> */}

        <DynamicSelectionInput
          label={t`Customers limit rule`}
          description={t`Leave empty if no limit`}
          fixedEntity={AppEntity.CUSTOMERS}
          {...form.getInputProps("customersSelection")}
        />

        <DateTimeInput label={t`Expire at`} {...form.getInputProps("expireAt")} />

        <BuilderCustomFields
          entity={AppEntity.PROMOTIONS}
          value={form.values.customFields}
          onChange={(value) => form.setFieldValue("customFields", value)}
        />

        <Center>
          <Button type="submit" loading={form.submitting}>
            {props.promotion ? t`Save` : t`Create`}
          </Button>
        </Center>
      </Stack>
    </form>
  );
};
