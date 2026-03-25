"use client";

import { Button } from "@/components/buttons/button";
import { ModalHead } from "@/components/modal/modal-head";
import { Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { IconCheck, IconId } from "@tabler/icons-react";
import { FC, useState } from "react";

import { useRouter } from "@/hooks/use-router";
import { Trans } from "@lingui/react/macro";
import { CustomerFragment } from "../graphql/fragmentCustomer.graphql";

interface ModalCustomerPlainCodeFormProps {
  customer: CustomerFragment;
  onDone?: (customer: CustomerFragment) => any;
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

    // TODO: Update customer plain code
    // const action = () => {
    //   // return updateCustomer(props.customer!._id, {
    //   //   ...props.customer,
    //   //   plainCode: values.plainCode,
    //   // });
    // };

    // await action()
    //   .then(async (res) => {
    //     if (props.onDone) await props.onDone?.(res);
    //     else router.push(`/customers/${res.code}`);
    //     modals.close("ModalCustomerPlainCodeForm");
    //   })
    //   .catch(onError);

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
    title: <ModalHead name={<Trans>Enter customer plain code</Trans>} icon={IconId} />,
    children: <ModalCustomerPlainCodeForm {...props} />,
  });
