"use client";

import { Errored } from "@/components/errored";
import { CustomerInformations } from "@/modules/customers/customer-detail/customer-information";
import { Group, Skeleton, Stack } from "@mantine/core";
import { IconCalendar, IconFiles, IconTimelineEvent, IconUserScan } from "@tabler/icons-react";
import { useParams } from "next/navigation";

import { SectionTitle } from "@/components/session-title";
import { FilesBox } from "@/modules/files/files-box";

import { Archived } from "@/components/archived";
import { ButtonArchive } from "@/components/buttons/button-archive";
import { Renderer } from "@/components/renderer";
import { CustomerKyc } from "@/modules/customers/customer-detail/customer-kyc-list";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { useAvailableWorkspaceModules } from "@/modules/workspaces/workspace-modules";
import { AppEntity } from "@/types";
import { nonLoading } from "@/utils/non-loading";
import { useMutation } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import dynamic from "next/dynamic";

import { Container } from "@/components/container";
import ArchiveCustomerDocument from "../graphql/archiveCustomer.graphql";
import { useCustomerByCode } from "../hooks/useCustomer";

const Activities = dynamic(
  () => import("@/modules/activities/activities").then((mod) => mod.Activities),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const EventsList = dynamic(
  () => import("@/modules/events/events-list").then((mod) => mod.EventsList),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const BookingsList = dynamic(
  () => import("./customer-bookings").then((mod) => mod.CustomerBookings),
  {
    ssr: false,
    loading: nonLoading,
  },
);

export const CustomerDetail = () => {
  const workspace = useWorkspace();
  const { getAvailableModule } = useAvailableWorkspaceModules();

  const params = useParams<{ code: string }>();

  const { customer, loading, error } = useCustomerByCode(params.code);

  const [archiveCustomer] = useMutation(ArchiveCustomerDocument);

  if (loading)
    return (
      <Container size={900}>
        <Stack p="md">
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
      </Container>
    );

  if (error || !customer)
    return (
      <Container size={900}>
        <Errored error={error} />
      </Container>
    );
  if (customer.isArchived)
    return (
      <Container size={900}>
        <Archived entity={<Trans>Customer</Trans>} />
      </Container>
    );

  return (
    <Container size={900}>
      <Stack gap={30} p="md">
        <CustomerInformations customer={customer} />

        <Renderer visible={!!getAvailableModule("customerKYCs")}>
          <Stack gap={10}>
            <SectionTitle name="KYC" icon={IconUserScan} />
            <CustomerKyc customer={customer} />
          </Stack>
        </Renderer>

        <Stack gap={10}>
          <SectionTitle name={<Trans>Bookings</Trans>} icon={IconCalendar} />
          <BookingsList customerId={customer._id} />
        </Stack>

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
          process={() => archiveCustomer({ variables: { id: customer._id } })}
        />
      </Stack>
    </Container>
  );
};
