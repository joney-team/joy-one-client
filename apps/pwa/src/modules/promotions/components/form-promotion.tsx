"use client";

import { Button } from "@/components/buttons/button";
import { DateTimeInput } from "@/components/inputs/date-time-input";
import { DynamicSelectionInput } from "@/components/inputs/dynamic-selection-input";
import { ImageInput } from "@/components/inputs/image-input";
import { DynamicSelectionOperator, PromotionStatus, PromotionType } from "@/graphql/enums.graphql";
import { CustomFieldValue, DynamicSelection, PromotionInput } from "@/graphql/types.graphql";
import { BuilderCustomFields } from "@/modules/custom-fields/components/builder-custom-fields";
import { AppEntity } from "@/types";
import { onFormError } from "@/utils/exceptions.utils";
import { useApolloClient } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Center, NumberInput, Select, SimpleGrid, Stack, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { type FC } from "react";
import CreatePromotionDocument from "../graphql/createPromotion.graphql";
import { PromotionFragment } from "../graphql/fragmentPromotion.graphql";
import UpdatePromotionDocument from "../graphql/updatePromotion.graphql";
import { promotionTypes } from "../promotions-constants";

export interface FormPromotionProps {
  promotion?: PromotionFragment;
  onSuccess?: () => void;
}

export const FormPromotion: FC<FormPromotionProps> = (props) => {
  const client = useApolloClient();
  const { t } = useLingui();

  const form = useForm<{
    name: string;
    description: string;
    image: string;
    expireAt: number;
    type: PromotionType;
    value: number | null;
    limitPerCustomer?: number | null;
    productsSelection: DynamicSelection;
    customersSelection: DynamicSelection;
    status: PromotionStatus;
    customFieldValues?: CustomFieldValue[];
  }>({
    initialValues: {
      name: props.promotion?.name || "",
      description: props.promotion?.description || "",
      image: props.promotion?.image || "",
      expireAt: props.promotion?.expireAt || 0,
      type: props.promotion?.type || PromotionType.DiscountRate,
      value: props.promotion?.value || null,
      limitPerCustomer: props.promotion?.limitPerCustomer,
      productsSelection: props.promotion?.productsSelection || {
        __typename: "DynamicSelection",
        entity: AppEntity.PRODUCTS,
        operator: DynamicSelectionOperator.Includes,
        value: [],
      },
      customersSelection: props.promotion?.customersSelection || {
        __typename: "DynamicSelection",
        entity: AppEntity.CUSTOMERS,
        operator: DynamicSelectionOperator.Includes,
        value: [],
      },
      status: props.promotion?.status || PromotionStatus.Active,
      customFieldValues: props.promotion?.customFieldValues || [],
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
        values.customFieldValues?.map((customField) => ({
          __typename: "CustomFieldValue",
          config: customField.config,
          key: customField.key,
          type: customField.type,
          customFieldId: customField.customFieldId,
          value: customField.value,
        })) || [];

      const input: PromotionInput = {
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

      let promotion: PromotionFragment | null = null;

      if (props.promotion) {
        promotion = await client
          .mutate({
            mutation: UpdatePromotionDocument,
            variables: {
              promotionId: props.promotion.id,
              input,
            },
          })
          .then((result) => result.data?.promotion!);
      } else {
        promotion = await client
          .mutate({
            mutation: CreatePromotionDocument,
            variables: {
              input,
            },
          })
          .then((result) => result.data?.promotion!);
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
        <TextInput label={<Trans>Name</Trans>} {...form.getInputProps("name")} />
        <Textarea label={<Trans>Description</Trans>} {...form.getInputProps("description")} />
        <ImageInput label={<Trans>Image</Trans>} {...form.getInputProps("image")} h={150} />

        <SimpleGrid cols={2}>
          <Select
            label={<Trans>Type</Trans>}
            {...form.getInputProps("type")}
            data={Object.values(PromotionType).map((type) => {
              return {
                value: type,
                label: t(promotionTypes[type].label),
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
          label={<Trans>Limit per customer</Trans>}
          {...form.getInputProps("limitPerCustomer")}
          placeholder={t`Leave empty if no limit`}
        />

        <DynamicSelectionInput
          label={<Trans>Customers limit rule</Trans>}
          description={t`Leave empty if no limit`}
          fixedEntity={AppEntity.CUSTOMERS}
          {...form.getInputProps("customersSelection")}
        />

        <DateTimeInput label={<Trans>Expire at</Trans>} {...form.getInputProps("expireAt")} />

        <BuilderCustomFields
          entity={AppEntity.PROMOTIONS}
          value={form.values.customFieldValues}
          onChange={(value) => form.setFieldValue("customFieldValues", value)}
        />

        <Center>
          <Button type="submit" loading={form.submitting}>
            {props.promotion ? <Trans>Save</Trans> : <Trans>Create</Trans>}
          </Button>
        </Center>
      </Stack>
    </form>
  );
};
