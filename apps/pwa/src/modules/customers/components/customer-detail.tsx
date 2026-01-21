"use client";

import { Button } from "@/components/buttons/button";
import { Errored } from "@/components/errored";
import { EventType } from "@/graphql/enums.graphql";
import { CustomerBookings } from "@/modules/customers/components/customer-booking";
import { CustomerInformations } from "@/modules/customers/components/customer-information";
import { CustomerEntity } from "@/modules/customers/customer-types";
import { useFetch } from "@/utils/use-fetch.util";
import { ActionIcon, Group, Skeleton, Stack } from "@mantine/core";
import {
  IconCalendarPlus,
  IconFiles,
  IconPill,
  IconStackPush,
  IconTimelineEvent,
  IconUserScan,
} from "@tabler/icons-react";
import { useParams } from "next/navigation";
import { Fragment, useEffect } from "react";
import { archiveCustomer, getCustomerByCode } from "../customer-service";

import { SectionTitle } from "@/components/session-title";
import { FilesBox } from "@/modules/files/files-box";
import { ModalCreateTask } from "@/modules/tasks/modals/modal-create-task";

import { Archived } from "@/components/archived";
import { ButtonArchive } from "@/components/buttons/button-archive";
import { CtasWrapper } from "@/components/cta-wrapper";
import { Renderer } from "@/components/renderer";
import { useLayout } from "@/layout/layout-context";
import { ModalCreateBooking } from "@/modules/bookings/modals/modal-create-booking";
import { CustomerKyc } from "@/modules/customers/components/customer-kyc-list";
import { OnModalPrescriptionForm } from "@/modules/prescriptions/modals/modal-prescription-form";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useAvailableWorkspaceModules } from "@/modules/workspaces/workspace-modules";
import { AppEntity } from "@/types";
import { nonLoading } from "@/utils/non-loading";
import { Trans } from "@lingui/react/macro";
import dynamic from "next/dynamic";

const Activities = dynamic(
  () => import("@/modules/activities/activities").then((mod) => mod.Activities),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const EventsList = dynamic(
  () => import("@/modules/events/events-list").then((mod) => mod.EventsList),
  {
    ssr: false,
    loading: nonLoading,
  }
);

export const CustomerDetail = () => {
  const workspace = useWorkspace();
  const { getAvailableModule } = useAvailableWorkspaceModules();
  const layout = useLayout();

  const params = useParams();
  const customerCode = params.code as string;

  const detail = useFetch<CustomerEntity>({
    id: `customers-${customerCode}`,
    fetch: async () => {
      return getCustomerByCode(customerCode);
    },
    refetchEvents: {
      types: [EventType.CustomerUpdated],
      condition: (e, data) =>
        data?._id === e.ref || (e.relatedEntities || []).some((v) => v.id === data?._id),
    },
  });

  const { data: customer } = detail;

  useEffect(() => {
    if (customer) {
      layout.setComponents({
        head: customer.name,
        navigation: (
          <Fragment>
            {workspace.hasPermission(WorkspacePermission.BOOKING_MANAGER) && (
              <ModalCreateBooking>
                {(modalCreateBooking) => (
                  <Button
                    leftIcon={IconCalendarPlus}
                    variant="outline"
                    onClick={() => modalCreateBooking.open({ customer })}
                    size="xs"
                  >
                    <Trans>Booking</Trans>
                  </Button>
                )}
              </ModalCreateBooking>
            )}

            <ModalCreateTask>
              {(modalCreateTask) => (
                <Button
                  leftIcon={IconStackPush}
                  variant="outline"
                  onClick={() => modalCreateTask.open({ initial: { customer: customer as any } })}
                  size="xs"
                >
                  <Trans>Task</Trans>
                </Button>
              )}
            </ModalCreateTask>
          </Fragment>
        ),
      });
    }
  }, [customer, workspace.member.permissions]);

  if (detail.isFetching)
    return (
      <Stack p={16}>
        <Skeleton height={150} />
        {new Array(3).fill(0).map((_, i) => (
          <Stack key={i}>
            <Group>
              <Skeleton key={i} height={20} width={100} />
            </Group>
            <Skeleton key={i} height={100} />
          </Stack>
        ))}
      </Stack>
    );

  if (detail.error || !customer) return <Errored error={detail.error} />;
  if (customer.isArchived) return <Archived entity={<Trans>Customer</Trans>} />;

  return (
    <Fragment>
      <Stack gap={30} p={16}>
        <CustomerInformations customer={customer} />

        <Renderer visible={!!getAvailableModule("customerKYCs")}>
          <Stack gap={10}>
            <SectionTitle name="KYC" icon={IconUserScan} />
            <CustomerKyc customer={customer} />
          </Stack>
        </Renderer>

        <Renderer visible={!!getAvailableModule("bookings")}>
          <CustomerBookings customer={customer} />
        </Renderer>

        <Stack gap={10}>
          <SectionTitle name={<Trans>Images & Documents</Trans>} icon={IconFiles} />

          <FilesBox
            refs={[`${AppEntity.CUSTOMERS}:${customer._id}`]}
            autoUpload
            specificDisabledRelated={["relatedReceiptId"]}
          />
        </Stack>

        <Stack gap={10}>
          <SectionTitle name={<Trans>Activities</Trans>} icon={IconTimelineEvent} />

          <Activities contextType={AppEntity.CUSTOMERS} contextId={customer._id} />
        </Stack>

        <EventsList ref={customer._id} />

        <ButtonArchive
          name={<Trans>Customer</Trans>}
          enabled={
            !customer.isArchived && workspace.hasPermission(WorkspacePermission.CUSTOMERS_ARCHIVE)
          }
          process={() => archiveCustomer(customer._id)}
        />
      </Stack>

      <CtasWrapper>
        <Renderer visible={!!getAvailableModule("prescriptions")}>
          <ActionIcon
            radius={150}
            size="xl"
            color="orange"
            onClick={() => OnModalPrescriptionForm({ customer })}
          >
            <IconPill strokeWidth={1.5} />
          </ActionIcon>
        </Renderer>
      </CtasWrapper>
    </Fragment>
  );
};
