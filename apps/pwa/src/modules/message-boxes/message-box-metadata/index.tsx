"use client";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { FlexSizeLegacy } from "@/components/flex-size-legacy";
import { TechIllustration } from "@/components/illustrations/tech";
import { useWorkspaceLayout } from "@/layout/hooks/use-workspace-layout";
import {
  ModalCreateBooking,
  ModalCreateBookingRef,
} from "@/modules/bookings/modals/modal-create-booking";
import { CustomerInput } from "@/modules/customers/components/customer-input";
import { getCustomer } from "@/modules/customers/customer-service";
import { CustomerEntity } from "@/modules/customers/customer-types";
import { ModalCreateLoan, ModalCreateLoanRef } from "@/modules/loans/modals/modal-create-loan";
import { setCustomerToMessageBox } from "@/modules/message-boxes/message-boxes-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { getDefaultWorkspaceView } from "@/modules/workspaces/workspace-view";
import { useFetch } from "@/utils/use-fetch.util";
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
import { useMessageBoxes } from "../message-boxes-context";
import { MessageBoxMetadataBookings } from "./message-box-metadata-bookings";
import { MessageBoxMetadataLoans } from "./message-box-metadata-loans";
import { AccordionItem } from "./message-box-metadata-types";
import { useAvailableWorkspaceModules } from "@/modules/workspaces/workspace-modules";
import { WorkspaceType } from "@/graphql/enums.graphql";

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
  // TODO: Add orders
  // {
  //   moduleId: "orders",
  //   component: MessageBoxMetadataOrders,
  // },
];

export const MetadataMessageBox: FC = () => {
  const messageBoxes = useMessageBoxes();
  const workspace = useWorkspace();
  const workspaceLayout = useWorkspaceLayout();
  const modalCreateBookingRef = useRef<ModalCreateBookingRef>(null);
  const modalCreateLoanRef = useRef<ModalCreateLoanRef>(null);
  const { getAvailableModule } = useAvailableWorkspaceModules();
  const { messageBox } = messageBoxes;

  const customer = useFetch<CustomerEntity | null>({
    id: `${messageBox?._id}-${messageBox?.customerId}`,
    fetch: async () => (messageBox?.customerId ? getCustomer(messageBox.customerId) : null),
  });

  if (!messageBox) return null;

  if (customer.isFetching)
    return (
      <Stack flex={1} p={16} align="center" justify="center">
        <Skeleton flex={1} />
      </Stack>
    );

  if (customer.data)
    return (
      <Stack flex={1} gap={0}>
        <Group
          p={12}
          gap={5}
          justify="space-between"
          style={{
            borderBottom: `1px solid ${workspaceLayout.dividerColor}`,
          }}
        >
          <Group gap={8}>
            <Avatar radius={8} customer={customer.data} />
            <Stack gap={0}>
              <Text fz={12} c="gray">
                #{customer.data.code}
              </Text>
              <Text fw={500}>{customer.data.name}</Text>
            </Stack>
          </Group>

          <Group gap={8}>
            {customer.data.email && (
              <ActionIcon variant="light" component={Link} href={`mailto:${customer.data.email}`}>
                <IconMail size={16} />
              </ActionIcon>
            )}

            {customer.data.phone && (
              <ActionIcon variant="light" component={Link} href={`tel:${customer.data.phone}`}>
                <IconPhoneCall size={16} />
              </ActionIcon>
            )}

            <Tooltip label={t`Unlink`}>
              <ActionIcon
                variant="light"
                color="gray"
                onClick={() => setCustomerToMessageBox(messageBox._id, null)}
              >
                <IconLinkOff size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        <FlexSizeLegacy>
          {(size) => {
            return (
              <ScrollArea h={size.height} w="100%">
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
                        workspace.view.menu ??
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
                                    const customerData = customer.data;
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
                            <item.component customer={customer.data!} />
                          </Accordion.Panel>
                        </Accordion.Item>
                      );
                    })}
                </Accordion>
              </ScrollArea>
            );
          }}
        </FlexSizeLegacy>

        <ModalCreateBooking ref={modalCreateBookingRef} />
        <ModalCreateLoan ref={modalCreateLoanRef} />
      </Stack>
    );

  return (
    <Stack p={16} align="center" flex={1} justify="center">
      <TechIllustration width={200} />

      <CustomerInput
        onSelect={(customer) => {
          if (!customer) return;
          return setCustomerToMessageBox(messageBox._id, customer._id);
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
