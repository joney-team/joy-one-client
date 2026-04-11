"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { TechIllustration } from "@/components/illustrations/tech";
import { WorkspaceType } from "@/graphql/enums.graphql";
import {
  ModalCreateBooking,
  ModalCreateBookingRef,
} from "@/modules/bookings/modals/modal-create-booking";
import { CustomerInput } from "@/modules/customers/components/customer-input";
import { useCustomer } from "@/modules/customers/hooks/useCustomer";
import { ModalCreateLoan, ModalCreateLoanRef } from "@/modules/loans/modals/modal-create-loan";
import { useWorkspaceSetting } from "@/modules/workspace-settings/hooks/use-workspace-setting";
import { getDefaultWorkspaceView } from "@/modules/workspace-settings/workspace-settings-view";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useAvailableWorkspaceModules } from "@/modules/workspaces/workspace-modules";
import { useApolloClient } from "@apollo/client/react";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  Accordion,
  ActionIcon,
  Group,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconLinkOff, IconLinkPlus, IconMail, IconPhoneCall, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { FC, useRef } from "react";
import { MessageBoxFragment } from "../../graphql/fragmentMessageBox.graphql";
import SetMessageBoxCustomerDocument from "../../graphql/setMessageBoxCustomer.graphql";
import { MessageBoxMetadataBookings } from "./message-box-metadata-bookings";
import { MessageBoxMetadataLoans } from "./message-box-metadata-loans";
import { MessageBoxMetadataOrders } from "./message-box-metadata-orders";
import { AccordionItem } from "./message-box-metadata-types";

const accordionItems: AccordionItem[] = [
  {
    moduleId: "loans",
    component: MessageBoxMetadataLoans,
    onCreate: (_, context) => context.actions.createLoan(),
    workspaceTypes: [WorkspaceType.Credit],
  },
  {
    moduleId: "bookings",
    component: MessageBoxMetadataBookings,
    onCreate: (_, context) => context.actions.createBooking(),
  },
  {
    moduleId: "orders",
    component: MessageBoxMetadataOrders,
  },
];

export const MetadataMessageBox: FC<{ box: MessageBoxFragment }> = ({ box }) => {
  const client = useApolloClient();
  const workspace = useWorkspace();
  const modalCreateBookingRef = useRef<ModalCreateBookingRef>(null);
  const modalCreateLoanRef = useRef<ModalCreateLoanRef>(null);
  const { getAvailableModule } = useAvailableWorkspaceModules();
  const { workspaceView } = useWorkspaceSetting();

  const { customer, loading: customerLoading } = useCustomer(box?.customerId);

  if (customerLoading)
    return (
      <Stack flex={1} p="md" align="center" justify="center">
        <Skeleton flex={1} />
      </Stack>
    );

  if (customer)
    return (
      <Stack flex={1} gap={0} mih={0}>
        <Group
          p={12}
          gap={5}
          justify="space-between"
          style={{
            borderBottom: `1px solid var(--app-divider-color)`,
          }}
        >
          <Group gap={8}>
            <Avatar radius={8} customer={customer} />
            <Stack gap={0}>
              <Text fz={12} c="gray">
                #{customer.code}
              </Text>
              <Text fw={500}>{customer.name}</Text>
            </Stack>
          </Group>

          <Group gap={8}>
            {customer.email && (
              <ActionIcon variant="light" component={Link} href={`mailto:${customer.email}`}>
                <IconMail size={16} />
              </ActionIcon>
            )}

            {customer.phone && (
              <ActionIcon variant="light" component={Link} href={`tel:${customer.phone}`}>
                <IconPhoneCall size={16} />
              </ActionIcon>
            )}

            <Tooltip label={t`Unlink`}>
              <ActionIcon
                variant="light"
                color="gray"
                onClick={() =>
                  client.mutate({
                    mutation: SetMessageBoxCustomerDocument,
                    variables: { boxId: box._id, customerId: null },
                  })
                }
              >
                <IconLinkOff size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        <ScrollArea.Autosize w="100%" flex={1}>
          <Accordion>
            {accordionItems
              .filter((item) => {
                if (item.workspaceTypes) {
                  return item.workspaceTypes.includes(workspace.type);
                }

                return true;
              })
              .map((item) => {
                const workspaceModule = getAvailableModule(item.moduleId);

                const isInView = (
                  workspaceView.menu ??
                  getDefaultWorkspaceView(workspace.type).menu ??
                  []
                ).some((v) => v.moduleId === item.moduleId);

                if (!workspaceModule || !isInView) return null;
                return (
                  <Accordion.Item key={workspaceModule.id} value={workspaceModule.id}>
                    <Accordion.Control>
                      <Group gap={8}>
                        <ActionIcon variant="subtle" color="dark" component="div">
                          <workspaceModule.icon size={18} />
                        </ActionIcon>
                        <Text>{workspaceModule.name}</Text>

                        {item.onCreate && (
                          <ActionIcon
                            variant="light"
                            color="gray"
                            size="sm"
                            component="div"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const customerData = customer;
                              if (!customerData) return;

                              item.onCreate?.(customerData, {
                                actions: {
                                  createLoan: () => {
                                    modalCreateLoanRef.current?.open({
                                      customer: customerData,
                                    });
                                  },
                                  createBooking: () => {
                                    modalCreateBookingRef.current?.open({
                                      customer: customerData,
                                    });
                                  },
                                },
                              });
                            }}
                          >
                            <IconPlus size={14} />
                          </ActionIcon>
                        )}
                      </Group>
                    </Accordion.Control>

                    <Accordion.Panel>
                      <item.component customer={customer} />
                    </Accordion.Panel>
                  </Accordion.Item>
                );
              })}
          </Accordion>
        </ScrollArea.Autosize>

        <ModalCreateBooking ref={modalCreateBookingRef} />
        <ModalCreateLoan ref={modalCreateLoanRef} />
      </Stack>
    );

  return (
    <Stack p="md" align="center" flex={1} justify="center">
      <TechIllustration width={200} />

      <CustomerInput
        onSelect={(customer) => {
          if (!customer) return;
          return client.mutate({
            mutation: SetMessageBoxCustomerDocument,
            variables: { boxId: box._id, customerId: customer._id },
          });
        }}
        renderValue={(ctx) => {
          return (
            <Button leftIcon={IconLinkPlus} variant="outline" radius={100} onClick={ctx.toggle}>
              <Trans>Link customer</Trans>
            </Button>
          );
        }}
      />
    </Stack>
  );
};
