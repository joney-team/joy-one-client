"use client";

import { Button } from "@/components/buttons/button";
import { Editor } from "@/components/editor/editor";
import { ModalHead } from "@/components/modal/modal-head";
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
import { ProductSelector } from "@/modules/products/components/product-selector";
import { ProductType } from "@/modules/products/products-types";
import { onError } from "@/utils/exceptions.utils";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  ActionIcon,
  Box,
  Card,
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
import { FC, Fragment, ReactNode, useState } from "react";
import { couponRuleBenefitTypes, discountTypes } from "../coupon-constants";

interface ModalCouponRuleFormArgs {
  rule?: CouponRuleEntity;
  onDone?: (rule: CouponRuleEntity) => void | Promise<void>;
}

const initialBenefits: CouponRuleBenefit[] = [{ type: CouponRuleBenefitType.FREE_ON_PRODUCT }];

export const ModalCouponRuleForm: FC<{
  children: (open: (args?: ModalCouponRuleFormArgs) => void) => ReactNode;
}> = ({ children }) => {
  const { t } = useLingui();
  const [opened, { open, close }] = useDisclosure(false);
  const [props, setProps] = useState<ModalCouponRuleFormArgs>();

  const [benefits, benefitsHandler] = useListState(props?.rule?.benefits || initialBenefits);

  const onClose = async () => close();

  const form = useForm({
    initialValues: {
      isCumulative: true,
      isActive: true,
    } as any,
    validate: {
      name: (value: string) => {
        if (!value) return t`Must be provided`;
      },
    },
  });

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
    <Fragment>
      {children((p) => {
        form.reset();
        setProps(p);

        if (p && p.rule) {
          form.setValues(p.rule);
          benefitsHandler.setState(p.rule.benefits);
        }

        open();
      })}
      <Modal
        title={
          <ModalHead
            name={`${props?.rule ? t`Update coupon rule` : t`Create coupon rule`}`}
            icon={IconNotes}
          />
        }
        onClose={onClose}
        opened={opened}
        size={1000}
      >
        <Stack gap={16}>
          <TextInput label={t`Name`} {...form.getInputProps("name")} />

          <InputWrapper label={t`Description`} {...form.getInputProps("description")}>
            <Editor
              defaultValue={form.values.description}
              onChangeHTML={(v) => form.setFieldValue("description", v)}
              placeholder={t`Description`}
            />
          </InputWrapper>

          <InputWrapper label={t`Settings`}>
            <Card withBorder p={8} mt={5}>
              <Group>
                <Switch
                  label={t`Allow cumulative coupon rules`}
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
                      {t`Rule`} {benefits.length === 1 ? "" : i + 1}
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
                leftIcon={IconPlus}
                variant="light"
                radius={100}
                onClick={() => benefitsHandler.append(initialBenefits[0])}
              >
                <Trans>Add rule</Trans>
              </Button>
            </Group>
          </Stack>

          <Group justify="center" mt={10}>
            <Button
              type="submit"
              miw={200}
              onClick={() => submit.handle()}
              loading={submit.isSubmitting}
            >
              <Trans>Complete</Trans>
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Fragment>
  );
};

const RuleBenfitForm: FC<{
  benefit: CouponRuleBenefit;
  onChange: (benefit: CouponRuleBenefit) => void;
  onRemove: () => void;
}> = (props) => {
  const { t } = useLingui();
  const { benefit, onChange } = props;

  return (
    <Stack>
      <Select
        label={<Trans>Type</Trans>}
        data={Object.values(CouponRuleBenefitType).map((v) => ({
          value: v,
          label: couponRuleBenefitTypes[v].label(),
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
                label={t`Type`}
                data={Object.values(DiscountType).map((v) => ({
                  value: v,
                  label: discountTypes[v].label(),
                }))}
                value={data.type}
                onChange={(v) =>
                  onChange({ ...benefit, data: { ...data, type: v as DiscountType, value: null } })
                }
              />

              <NumberInput
                label={t`Value`}
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
                      label={<Trans>Product</Trans>}
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
                  label={<Trans>Type</Trans>}
                  data={Object.values(DiscountType).map((v) => ({
                    value: v,
                    label: discountTypes[v].label(),
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
                  label={<Trans>Value</Trans>}
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
                      label={<Trans>Product</Trans>}
                      value={data.product?.name}
                      onChange={() => false}
                      readOnly
                      onClick={ctx.toggle}
                    />
                  );
                }}
              />

              <NumberInput
                label={<Trans>Product quantity</Trans>}
                description={t`Quantity of free product, leave blank or fill in 0 if you want to be free all.`}
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
