"use client";

import { Button } from "@/components/buttons/button";
import { SearchSelectInput } from "@/components/inputs/search-select-input";
import { ModalTitle } from "@/components/modal-title";
import { useFormSubmit } from "@/hooks/use-form";
import { createCoupon, getCouponRules } from "@/modules/coupons/coupon-service";
import { CouponDto, CouponEntity } from "@/modules/coupons/coupon-types";
import { getCustomers } from "@/modules/customers/customer-service";
import { tl } from "@/modules/lang/lang-service";
import { DateTime } from "@/utils/date-time.utils";
import { onError } from "@/utils/exceptions.utils";
import { String } from "@/utils/string.utils";
import {
  Card,
  Group,
  InputWrapper,
  Modal,
  NumberInput,
  SimpleGrid,
  Stack,
  TextInput,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconNotes } from "@tabler/icons-react";
import { FC, useState } from "react";
import { CouponBenefits } from "../coupon-benefits";
import { OnModalCouponRuleForm } from "./modal-coupon-rule-form";

interface ModalCouponFormProps {
  coupon?: CouponEntity;
  onDone?: (coupon: CouponEntity) => void | Promise<void>;
}

export let OnModalCouponForm: (props?: ModalCouponFormProps) => void = () => {};

export const ModalCouponForm: FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [props, setProps] = useState<ModalCouponFormProps>();

  const onClose = async () => close();

  const form = useForm({
    initialValues: {
      quantity: 0,
    } as any,
    validate: {
      quantity: (value: string) => {
        if (typeof value !== "number") return tl("required");
      },
      rule: (value: string) => {
        if (!value) return tl("required");
      },
    },
  });

  OnModalCouponForm = async (p) => {
    form.reset();
    setProps(p);
    if (p?.coupon) form.setValues(p.coupon);
    open();
  };

  const submit = useFormSubmit(form, {
    onSubmit: async (values) => {
      const dto: CouponDto = {
        ruleId: values.rule._id,
        quantity: values.quantity,
        code: values.code,
        expiredAt: values.expiredAt,
        customerId: values.customer?._id,
        receiptId: values.receipt?._id,
        ticketId: values.ticket?._id,
      };

      const coupon = await createCoupon(dto);
      await props?.onDone?.(coupon);
      close();
    },
    onError,
  });

  return (
    <Modal
      title={
        <ModalTitle
          title={String.capitalizeFirstLetter(
            `${tl(props?.coupon ? "update" : "create")} ${tl("coupon")}`
          )}
          icon={IconNotes}
        />
      }
      onClose={onClose}
      opened={opened}
    >
      <Stack gap={16}>
        <SimpleGrid cols={{ md: 1 }}>
          <SearchSelectInput
            withAsterisk
            label={tl("coupon_rule")}
            {...form.getInputProps("rule")}
            value={form.values.rule?._id}
            onChange={(v) => form.setFieldValue("rule", v?.data)}
            onSearch={(q) =>
              getCouponRules({ q }).then(({ data }) =>
                data.map((r) => ({ label: r.name, id: r._id, data: r }))
              )
            }
            onEdit={() =>
              OnModalCouponRuleForm({
                rule: form.values.rule,
                onDone: (rule) => form.setFieldValue("rule", rule),
              })
            }
            onCreate={() =>
              OnModalCouponRuleForm({
                onDone: (rule) => form.setFieldValue("rule", rule),
              })
            }
          />

          {!!form.values.rule && <CouponBenefits benefits={form.values.rule.benefits} />}

          <TextInput label={tl("code")} {...form.getInputProps("code")} />

          <NumberInput
            withAsterisk
            label={tl("quantity")}
            description={tl("coupon_quantity_description")}
            {...form.getInputProps("quantity")}
          />

          <InputWrapper label={String.capitalizeFirstLetter(`${tl("settings")} ${tl("limit")}`)}>
            <Card withBorder p={8}>
              <Stack gap={10}>
                <SearchSelectInput
                  label={tl("customer")}
                  onSearch={(q) =>
                    getCustomers({ q }).then(({ data }) =>
                      data.map((r) => ({
                        label: `${r.name} ${r.phone || r.email}`.trim(),
                        id: r._id,
                        data: r,
                      }))
                    )
                  }
                  {...form.getInputProps("customer")}
                />

                <DateTimePicker
                  label={tl("expire_at")}
                  {...form.getInputProps("expiredAt")}
                  value={DateTime.secondsToTime(form.values.expiredAt)}
                  onChange={(v) => form.setFieldValue("expiredAt", DateTime.timeToSeconds(v))}
                />
              </Stack>
            </Card>
          </InputWrapper>
        </SimpleGrid>

        <Group justify="center" mt={10}>
          <Button type="submit" miw={200} onClick={submit.handle} loading={submit.isSubmitting}>
            {tl("complete")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
