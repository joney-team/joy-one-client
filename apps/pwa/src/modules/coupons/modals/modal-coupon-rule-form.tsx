"use client";

import { Button } from "@/components/buttons/button";
import { Editor } from "@/components/editor";
import { ModalTitle } from "@/components/modal-title";
import { ProductSelector } from "@/modules/products/components/product-selector";
import { useFormSubmit } from "@/hooks/use-form";
import { createCouponRule, updateCouponRule } from "@/modules/coupons/coupon-service";
import {
  CouponRuleBenefit,
  CouponRuleBenefitType,
  CouponRuleDto,
  CouponRuleEntity,
  DiscountOnProductData,
  DiscountOnTotalData,
  DiscountType,
  FreeOnProductData,
} from "@/modules/coupons/coupon-types";
import { tl } from "@/modules/lang/lang-service";
import { ProductType } from "@/modules/products/products-types";
import { onError } from "@/utils/exceptions.utils";
import { capitalize, String } from "@/utils/string.utils";
import {
  ActionIcon,
  Box,
  Card,
  em,
  Group,
  InputWrapper,
  Modal,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure, useListState } from "@mantine/hooks";
import { IconNotes, IconPlus, IconX } from "@tabler/icons-react";
import { FC, Fragment, useState } from "react";

interface ModalCouponRuleFormProps {
  rule?: CouponRuleEntity;
  onDone?: (rule: CouponRuleEntity) => void | Promise<void>;
}

export let OnModalCouponRuleForm: (props?: ModalCouponRuleFormProps) => void = () => {};
const initialBenefits: CouponRuleBenefit[] = [{ type: CouponRuleBenefitType.FREE_ON_PRODUCT }];

export const ModalCouponRuleForm: FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [props, setProps] = useState<ModalCouponRuleFormProps>();

  const [benefits, benefitsHandler] = useListState(props?.rule?.benefits || initialBenefits);

  const onClose = async () => close();

  const form = useForm({
    initialValues: {
      isCumulative: true,
      isActive: true,
    } as any,
    validate: {
      name: (value: string) => {
        if (!value) return tl("required");
      },
    },
  });

  OnModalCouponRuleForm = async (p) => {
    form.reset();
    setProps(p);

    if (p && p.rule) {
      form.setValues(p.rule);
      benefitsHandler.setState(p.rule.benefits);
    }

    open();
  };

  const submit = useFormSubmit(form, {
    onSubmit: async (values) => {
      const dto: CouponRuleDto = {
        name: values.name,
        benefits: benefits.map((b) => {
          if (b.data?.product) delete b.data?.product;
          return b;
        }),
        terms: [],
        description: values.description,
        image: values.image,
        isCumulative: values.isCumulative,
        isActive: values.isActive,
      };

      let rule: CouponRuleEntity;

      if (props?.rule) {
        rule = await updateCouponRule(props.rule._id, dto);
      } else {
        rule = await createCouponRule(dto);
      }

      await props?.onDone?.(rule);
      close();
    },
    onError,
  });

  return (
    <Modal
      title={
        <ModalTitle
          title={String.capitalizeFirstLetter(
            `${tl(props?.rule ? "update" : "create")} ${tl("coupon_rules")}`
          )}
          icon={IconNotes}
        />
      }
      onClose={onClose}
      opened={opened}
      size={1000}
    >
      <Stack gap={16}>
        <TextInput label={tl("name")} {...form.getInputProps("name")} />

        <InputWrapper label={tl("description")} {...form.getInputProps("description")}>
          <Editor
            value={form.values.description}
            onChangeHTML={(v) => form.setFieldValue("description", v)}
            placeholder={tl("description")}
          />
        </InputWrapper>

        <InputWrapper label={tl("settings")}>
          <Card withBorder p={8} mt={5}>
            <Group>
              <Switch
                label={tl("allow_cumulative_coupon_rule")}
                checked={form.values.isCumulative}
                onChange={(v) => form.setFieldValue("isCumulative", v)}
              />
            </Group>
          </Card>
        </InputWrapper>

        <Stack mt={5}>
          {benefits.map((benefit, i) => (
            <Card key={i} withBorder shadow="none" p={10}>
              <Stack gap={5}>
                <Group justify="space-between">
                  <Text fz="xs" fw={700}>
                    {tl("rule")} {benefits.length === 1 ? "" : i + 1}
                  </Text>

                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    disabled={benefits.length === 1}
                    onClick={() => benefitsHandler.remove(i)}
                  >
                    <IconX size={16} />
                  </ActionIcon>
                </Group>
                <Box flex={1}>
                  <RuleBenfitForm
                    key={i}
                    benefit={benefit}
                    onChange={(v) => benefitsHandler.setItem(i, v)}
                    onRemove={() => benefitsHandler.remove(i)}
                  />
                </Box>
              </Stack>
            </Card>
          ))}

          <Group>
            <Button
              size="xs"
              leftSection={<IconPlus size={16} style={{ marginRight: -5 }} />}
              variant="light"
              radius={100}
              fz={em(14)}
              onClick={() => benefitsHandler.append(initialBenefits[0])}
            >
              {capitalize(`${tl("add")} ${tl("rule")}`)}
            </Button>
          </Group>
        </Stack>

        <Group justify="center" mt={10}>
          <Button type="submit" miw={200} onClick={submit.handle} loading={submit.isSubmitting}>
            {tl("complete")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

const RuleBenfitForm: FC<{
  benefit: CouponRuleBenefit;
  onChange: (benefit: CouponRuleBenefit) => void;
  onRemove: () => void;
}> = (props) => {
  const { benefit, onChange } = props;

  return (
    <Stack>
      <Select
        label={tl("type")}
        data={Object.values(CouponRuleBenefitType).map((v) => ({
          value: v,
          label: tl(`crbt_${v}`),
        }))}
        value={benefit.type}
        onChange={(v) => onChange({ ...benefit, type: v as CouponRuleBenefitType })}
      />

      {(function () {
        if (benefit.type === CouponRuleBenefitType.DISCOUNT_ON_TOTAL) {
          const data = (benefit.data || {}) as DiscountOnTotalData;

          return (
            <SimpleGrid cols={{ md: 2 }}>
              <Select
                label={tl("type")}
                data={Object.values(DiscountType).map((v) => ({ value: v, label: tl(`cdt_${v}`) }))}
                value={data.type}
                onChange={(v) =>
                  onChange({ ...benefit, data: { ...data, type: v as DiscountType, value: null } })
                }
              />

              <NumberInput
                label={tl("value")}
                hideControls
                value={data.value}
                onChange={(v) => onChange({ ...benefit, data: { ...data, value: v } })}
              />
            </SimpleGrid>
          );
        }

        if (benefit.type === CouponRuleBenefitType.DISCOUNT_ON_PRODUCT) {
          const data = (benefit.data || {}) as DiscountOnProductData;

          return (
            <Fragment>
              <ProductSelector
                type={[ProductType.PRODUCT, ProductType.SERVICE]}
                onSelect={(product) =>
                  onChange({ ...benefit, data: { ...data, product, productId: product._id } })
                }
                target={(ctx) => {
                  return (
                    <TextInput
                      flex={1}
                      label={tl("product")}
                      value={data.product?.name}
                      onChange={() => false}
                      readOnly
                      onClick={ctx.toggle}
                    />
                  );
                }}
              />

              <SimpleGrid cols={{ md: 2 }}>
                <Select
                  label={tl("type")}
                  data={Object.values(DiscountType).map((v) => ({
                    value: v,
                    label: tl(`cdt_${v}`),
                  }))}
                  value={data.type}
                  onChange={(v) =>
                    onChange({
                      ...benefit,
                      data: { ...data, type: v as DiscountType, value: null },
                    })
                  }
                />

                <NumberInput
                  label={tl("value")}
                  hideControls
                  value={data.value}
                  onChange={(v) => onChange({ ...benefit, data: { ...data, value: v } })}
                />
              </SimpleGrid>
            </Fragment>
          );
        }

        if (benefit.type === CouponRuleBenefitType.FREE_ON_PRODUCT) {
          const data = (benefit.data || {}) as FreeOnProductData;

          return (
            <Fragment>
              <ProductSelector
                type={[ProductType.PRODUCT, ProductType.SERVICE]}
                onSelect={(product) =>
                  onChange({ ...benefit, data: { ...data, product, productId: product._id } })
                }
                target={(ctx) => {
                  return (
                    <TextInput
                      flex={1}
                      label={tl("product")}
                      value={data.product?.name}
                      onChange={() => false}
                      readOnly
                      onClick={ctx.toggle}
                    />
                  );
                }}
              />

              <NumberInput
                label={tl("product_quantity")}
                description={tl("coupon_rule_free_on_product_quantity_description")}
                hideControls
                value={data.quantity}
                onChange={(v) => onChange({ ...benefit, data: { ...data, quantity: v } })}
              />
            </Fragment>
          );
        }
      })()}
    </Stack>
  );
};
