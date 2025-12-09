"use client";

import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { onError } from "@/utils/exceptions.utils";
import { Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { IconCheck, IconId } from "@tabler/icons-react";
import { FC, useState } from "react";
import { updateCustomer } from "../customer-service";
import { CustomerShortInfo } from "../customer-types";

import { useRouter } from "@/hooks/use-router";
import { Trans } from "@lingui/react/macro";

interface ModalCustomerPlainCodeFormProps {
  customer: CustomerShortInfo;
  onDone?: (customer: CustomerShortInfo) => any;
}

export const ModalCustomerPlainCodeForm: FC<ModalCustomerPlainCodeFormProps> = (props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm({
    initialValues: {
      plainCode: props.customer.plainCode,
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    setIsSubmitting(true);

    const action = () =>
      updateCustomer(props.customer!._id, {
        ...props.customer,
        plainCode: values.plainCode,
      });

    await action()
      .then(async (res) => {
        if (props.onDone) await props.onDone?.(res);
        else router.push(`/customers/${res.code}`);
        modals.close("ModalCustomerPlainCodeForm");
      })
      .catch(onError);

    setIsSubmitting(false);
  });

  return (
    <Stack>
      <TextInput label={<Trans>Customer plain code</Trans>} {...form.getInputProps("plainCode")} />

      <Button
        mt={10}
        type="submit"
        loading={isSubmitting}
        onClick={() => onSubmit()}
        leftSection={<IconCheck strokeWidth={1.2} />}
        disabled={!form.isDirty()}
      >
        <Trans>Complete</Trans>
      </Button>
    </Stack>
  );
};

export const OnModalCustomerPlainCodeForm = (props: ModalCustomerPlainCodeFormProps) =>
  modals.open({
    modalId: "ModalCustomerPlainCodeForm",
    title: <ModalTitle title={<Trans>Enter customer plain code</Trans>} icon={IconId} />,
    children: <ModalCustomerPlainCodeForm {...props} />,
  });
