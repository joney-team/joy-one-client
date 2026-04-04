"use client";

import { Button } from "@/components/buttons/button";
import { Circle } from "@/components/circle";
import { Errored } from "@/components/errored";
import { ModalHead } from "@/components/modal/modal-head";
import { CustomerFormStatus, EventType } from "@/graphql/enums.graphql";
import { customerFormStatuses } from "@/modules/customer-forms/customer-form-constants";
import { useEventsListener } from "@/modules/events/event-service";
import { useLocations } from "@/modules/locations/locations-context";
import { useColor } from "@/modules/theme/use-color";
import { onError } from "@/utils/exceptions.utils";
import { useMutation, useQuery } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Anchor, Grid, Group, Skeleton, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconCheck, IconMessageUser } from "@tabler/icons-react";
import { FC } from "react";
import { InputModalType, ModalInput } from "../../../modals/modal-input";

import { normalizeCustomerFormInput } from "../../customers/utils/normalize-customer-form-input";
import GetCustomerFormByIdDocument from "../graphql/getCustomerFormById.graphql";
import UpdateCustomerFormDocument from "../graphql/updateCustomerForm.graphql";

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

const CustomerFormApproval: FC<CustomerFormModalProps> = (props) => {
  const { t } = useLingui();
  const color = useColor();
  const { renderVnLocation } = useLocations();

  const [updateCustomerForm] = useMutation(UpdateCustomerFormDocument);

  const {
    data: customerFormData,
    loading: customerFormLoading,
    error: customerFormError,
    refetch: customerFormRefetch,
  } = useQuery(GetCustomerFormByIdDocument, {
    variables: {
      id: props._id,
    },
  });

  useEventsListener(
    [EventType.CustomerFormNew, EventType.CustomerFormUpdated, EventType.CustomerFormArchived],
    (event) => {
      if (event.ref === props._id) {
        customerFormRefetch();
      }
    },
  );

  if (customerFormLoading) return <Skeleton height={150} />;
  if (customerFormError || !customerFormData) return <Errored error={customerFormError} />;

  const customerForm = customerFormData.customerForm;

  const onComplete = async () => {
    try {
      await updateCustomerForm({
        variables: {
          formId: props._id,
          input: {
            ...normalizeCustomerFormInput(customerForm),
            status: CustomerFormStatus.Completed,
          },
        },
      });
    } catch (error) {
      onError(error);
    }
  };

  return (
    <Stack>
      <RowInfo label={t`Name`} value={customerForm.name} />
      <RowInfo
        label={t`Phone`}
        value={
          <Anchor className="anchor" href={`tel:${customerForm.phone}`}>
            {customerForm.phone}
          </Anchor>
        }
      />
      <RowInfo label={t`Location`} value={renderVnLocation(customerForm.vnLocation)} />

      {(function () {
        if (customerForm.status === CustomerFormStatus.Pending) {
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
                            await updateCustomerForm({
                              variables: {
                                formId: props._id,
                                input: {
                                  ...normalizeCustomerFormInput(customerForm),
                                  status: CustomerFormStatus.Cancelled,
                                  cancelReason: value,
                                },
                              },
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

              <Button rightIcon={IconCheck} onClick={onComplete}>
                <Trans>Complete</Trans>
              </Button>
            </Group>
          );
        }

        const status = customerFormStatuses[customerForm.status];

        return (
          <RowInfo
            label={t`Status`}
            value={
              <Stack gap={5}>
                <Group gap={8}>
                  <Circle size={12} color={color(status.color)} />
                  {t(status.label)}
                </Group>

                {customerForm.cancelReason && (
                  <Text c="red">
                    <Trans>Reason</Trans>: {customerForm.cancelReason}
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

export const OnCustomerFormApprovalModal: (props: CustomerFormModalProps) => void = (props) => {
  return modals.open({
    modalId: "CustomerFormApprovalModal",
    withCloseButton: false,
    title: (
      <ModalHead
        onClose={() => modals.close("CustomerFormApprovalModal")}
        name={<Trans>Customer forms</Trans>}
        icon={IconMessageUser}
      />
    ),
    children: <CustomerFormApproval {...props} />,
  });
};
