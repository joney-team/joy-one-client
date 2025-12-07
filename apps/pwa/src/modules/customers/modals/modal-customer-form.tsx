"use client";

import { Button } from "@/components/buttons/button";
import { Circle } from "@/components/circle";
import { Errored } from "@/components/errored";
import { ModalTitle } from "@/components/modal-title";
import { customerFormStatuses } from "@/modules/customer-forms/customer-form-constants";
import {
  getCustomerForm,
  updateCustomerForm,
} from "@/modules/customer-forms/customer-form-service";
import { CustomerFormStatus } from "@/modules/customer-forms/customer-form-types";
import { EventType } from "@/graphql/enums.graphql";
import { useLocations } from "@/modules/locations/locations-context";
import { useColor } from "@/modules/theme/use-color";
import { onError } from "@/utils/exceptions.utils";
import { useFetch } from "@/utils/use-fetch.util";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Anchor, Grid, Group, Skeleton, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconCheck, IconMessageUser } from "@tabler/icons-react";
import { FC } from "react";
import { InputModalType, ModalInput } from "../../../modals/modal-input";

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
        <Group gap={10}>
          {typeof props.value === "string" ? <Text>{props.value || "--"}</Text> : props.value}
        </Group>
      </Grid.Col>
    </Grid>
  );
};

const CustomerFormModal: FC<CustomerFormModalProps> = (props) => {
  const color = useColor();
  const { renderVnLocation: renderLocation } = useLocations();
  const customerForm = useFetch({
    id: props._id,
    fetch: () => getCustomerForm(props._id),
    refetchEvents: [
      EventType.CustomerFormNew,
      EventType.CustomerFormUpdated,
      EventType.CustomerFormArchived,
    ],
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

  const onCancel = async () => {};

  return (
    <Stack>
      <RowInfo label={t`Name`} value={customerForm.data.name} />
      <RowInfo
        label={t`Phone`}
        value={
          <Anchor className="anchor" href={`tel:${customerForm.data.phone}`}>
            {customerForm.data.phone}
          </Anchor>
        }
      />
      <RowInfo label={t`Location`} value={renderLocation(customerForm.data.vnLocation)} />

      {(function () {
        if (customerForm.data.status === CustomerFormStatus.PENDING) {
          return (
            <Group justify="center" mt={12}>
              <ModalInput>
                {(openInput) => (
                  <Button
                    variant="outline"
                    color="gray"
                    onClick={() => {
                      openInput({
                        type: InputModalType.TEXTAREA,
                        title: t`Cancel reason`,
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
                    }}
                  >
                    <Trans>Cancel</Trans>
                  </Button>
                )}
              </ModalInput>

              <Button action rightIcon={IconCheck} onClick={onComplete}>
                <Trans>Complete</Trans>
              </Button>
            </Group>
          );
        }

        const status = customerFormStatuses[customerForm.data.status];

        return (
          <RowInfo
            label={t`Status`}
            value={
              <Stack gap={5}>
                <Group gap={8}>
                  <Circle size={12} color={color(status.color)} />
                  {status.label()}
                </Group>

                {customerForm.data.cancelReason && (
                  <Text c="red">
                    {t`Reason`}: {customerForm.data.cancelReason}
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
    title: <ModalTitle title={t`Customer forms`} icon={IconMessageUser} />,
    children: <CustomerFormModal {...props} />,
  });
};
