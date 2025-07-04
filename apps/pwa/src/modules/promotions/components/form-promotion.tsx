import { Button } from "@/components/buttons/button";
import { DateTimeInput } from "@/components/inputs/date-time-input";
import { DynamicSelectionInput } from "@/components/inputs/dynamic-selection-input";
import { ImageInput } from "@/components/inputs/image-input";
import { api } from "@/modules/apis";
import { t } from "@/modules/lang/lang-service";
import { AppEntity, DynamicSelection, DynamicSelectionOperator } from "@/types";
import { onFormError } from "@/utils/exceptions.utils";
import { Center, NumberInput, Select, SimpleGrid, Stack, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { type FC } from "react";
import { promotionRuleTypeConfigs, promotionRuleValueConfig } from "../promotions-service";
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
    limitPerCustomer: number | null;
    productsSelection: DynamicSelection;
    customersSelection: DynamicSelection;
    status: PromotionStatus;
  }>({
    initialValues: {
      name: props.promotion?.name || "",
      description: props.promotion?.description || "",
      image: props.promotion?.image || "",
      expireAt: props.promotion?.expireAt || 0,
      type: props.promotion?.type || PromotionType.DISCOUNT_RATE,
      value: props.promotion?.value || null,
      limitPerCustomer: props.promotion?.limitPerCustomer || null,
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
    },
    validate: {
      name: (value) => {
        if (!value) return t("name_is_required");
      },
      value: (value) => {
        if (!value) return t("value_is_required");
      },
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    try {
      const dto: PromotionDto = {
        name: values.name,
        description: values.description,
        image: values.image,
        expireAt: values.expireAt,
        type: values.type,
        value: values.value as number,
        limitPerCustomer: values.limitPerCustomer as number,
        productsSelection: {
          ...values.productsSelection,
          value: values.productsSelection.value.map((v) => v._id),
        },
        customersSelection: {
          ...values.customersSelection,
          value: values.customersSelection.value.map((v) => v._id),
        },
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

  const ruleValueConfig = promotionRuleValueConfig[form.values.type];

  return (
    <form onSubmit={onSubmit}>
      <Stack>
        <TextInput label={t("name")} {...form.getInputProps("name")} />
        <Textarea label={t("description")} {...form.getInputProps("description")} />
        <ImageInput label={t("image")} {...form.getInputProps("image")} h={150} />

        <SimpleGrid cols={2}>
          <Select
            label={t("type")}
            {...form.getInputProps("type")}
            data={Object.values(PromotionType).map((type) => {
              const config = promotionRuleTypeConfigs[type];
              return {
                value: type,
                label: t(config.label),
              };
            })}
            onChange={(value) => {
              form.setFieldValue("type", value as PromotionType);
              form.setFieldValue("value", null);
            }}
          />

          <NumberInput
            label={t(ruleValueConfig.label)}
            {...form.getInputProps("value")}
            min={ruleValueConfig.min}
            max={ruleValueConfig.max}
          />
        </SimpleGrid>

        <NumberInput
          label={t("limit_per_customer")}
          {...form.getInputProps("limitPerCustomer")}
          placeholder={t("leave_empty_if_no_limit")}
        />

        {/* <DynamicSelectionInput
          label={t("products_limit_rule")}
          description={t("leave_empty_if_no_limit")}
          fixedEntity={AppEntity.PRODUCTS}
          {...form.getInputProps("productsSelection")}
        /> */}

        <DynamicSelectionInput
          label={t("customers_limit_rule")}
          description={t("leave_empty_if_no_limit")}
          fixedEntity={AppEntity.CUSTOMERS}
          {...form.getInputProps("customersSelection")}
        />

        <DateTimeInput label={t("expireAt")} {...form.getInputProps("expireAt")} />

        <Center>
          <Button type="submit" loading={form.submitting}>
            {t(props.promotion ? "save" : "create")}
          </Button>
        </Center>
      </Stack>
    </form>
  );
};
