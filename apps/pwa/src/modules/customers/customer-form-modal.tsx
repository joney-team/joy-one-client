import { useColor } from "@/modules/theme/use-color";
import { Button } from "@/components/buttons/button";
import { Circle } from "@/components/circle";
import { Errored } from "@/components/errored";
import { ModalTitle } from "@/components/modal-title";
import {
  customerFormStatusConfigs,
  getCustomerForm,
  updateCustomerForm,
} from "@/modules/customer-forms/customer-form-service";
import { CustomerFormStatus } from "@/modules/customer-forms/customer-form-types";
import { EventType } from "@/modules/events/event-types";
import { t } from "@/modules/lang/lang-service";
import { renderLocation } from "@/modules/locations/locations-service";
import { onError } from "@/utils/exceptions.utils";
import { useFetch } from "@/utils/use-fetch.util";
import { Anchor, Grid, Group, Skeleton, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconCheck, IconMessageUser } from "@tabler/icons-react";
import { FC } from "react";
import { InputModalType, OnModalInput } from "../../modals/modal-input";

interface CustomerFormModalProps {
  _id: string;
}

export const RowInfo: FC<{
  label: string;
  value: any;
}> = (props) => {
  return (
    <Grid>
      <Grid.Col span={4}>
        <Stack gap={5}>
          <Text fz={16} fw={700} c="gray">
            {props.label}
          </Text>
        </Stack>
      </Grid.Col>

      <Grid.Col span="auto">
        <Group gap={10}>{typeof props.value === "string" ? <Text>{props.value || "--"}</Text> : props.value}</Group>
      </Grid.Col>
    </Grid>
  );
};

const CustomerFormModal: FC<CustomerFormModalProps> = (props) => {
  const color = useColor();
  const customerForm = useFetch({
    id: props._id,
    fetch: () => getCustomerForm(props._id),
    events: [EventType.CUSTOMER_FORM_NEW, EventType.CUSTOMER_FORM_UPDATED, EventType.CUSTOMER_FORM_ARCHIVED],
  });

  if (customerForm.isFetching) return <Skeleton height={150} />;
  if (customerForm.error || !customerForm.data) return <Errored error={customerForm.error} />;

  const onComplete = async () => {
    try {
      await updateCustomerForm(props._id, {
        ...customerForm.data!,
        status: CustomerFormStatus.COMPLETED,
      });
    } catch (error) {
      onError(error);
    }
  };

  const onCancel = async () => {
    OnModalInput({
      type: InputModalType.TEXTAREA,
      title: t("cancel_reason"),
      color: "red",
      required: true,
      onDone: async (value) => {
        try {
          await updateCustomerForm(props._id, {
            ...customerForm.data!,
            status: CustomerFormStatus.CANCELLED,
            cancelReason: value,
          });
        } catch (error) {
          onError(error);
        }
      },
    });
  };

  return (
    <Stack>
      <RowInfo label={t("name")} value={customerForm.data.name} />
      <RowInfo
        label={t("phone")}
        value={
          <Anchor className="anchor" href={`tel:${customerForm.data.phone}`}>
            {customerForm.data.phone}
          </Anchor>
        }
      />
      <RowInfo label={t("location")} value={renderLocation(customerForm.data.location)} />

      {(function () {
        if (customerForm.data.status === CustomerFormStatus.PENDING) {
          return (
            <Group justify="center" mt={12}>
              <Button variant="outline" color="gray" onClick={onCancel}>
                {t("cancel")}
              </Button>

              <Button action rightIcon={IconCheck} onClick={onComplete}>
                {t("complete")}
              </Button>
            </Group>
          );
        }

        const status = customerFormStatusConfigs[customerForm.data.status];

        return (
          <RowInfo
            label={t("status")}
            value={
              <Stack gap={5}>
                <Group gap={8}>
                  <Circle size={12} color={color(status.color)} />
                  {t(status.label)}
                </Group>

                {customerForm.data.cancelReason && (
                  <Text c="red">
                    {t("reason")}: {customerForm.data.cancelReason}
                  </Text>
                )}
              </Stack>
            }
          />
        );
      })()}
    </Stack>
  );
};

export const OnCustomerFormModal: (props: CustomerFormModalProps) => void = (props) => {
  return modals.open({
    modalId: "CustomerFormModal",
    title: <ModalTitle title={t("customerForms")} icon={IconMessageUser} />,
    children: <CustomerFormModal {...props} />,
  });
};
