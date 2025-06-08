"use client";

import { Button } from "@/components/buttons/button";
import { Errored } from "@/components/errored";
import { Comments } from "@/modules/comments/comments";
import { CustomerBookings } from "@/modules/customers/customer-booking";
import { CustomerInformations } from "@/modules/customers/customer-information";
import { CustomerEntity } from "@/modules/customers/customer-types";
import { EventType } from "@/modules/events/event-types";
import { useFetch } from "@/utils/use-fetch.util";
import { ActionIcon, Group, Skeleton, Stack } from "@mantine/core";
import { IconCalendarPlus, IconFiles, IconPill, IconStackPush, IconUserScan } from "@tabler/icons-react";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { archiveCustomer, getCustomerByCode } from "./customer-service";

import { EventList } from "@/components/event-list";
import { SessionTitle } from "@/components/session-title";
import { CustomerTasks } from "@/modules/customers/customer-tasks";
import { FilesBox } from "@/modules/files/files-box";
import { OnModalCreateTask } from "@/modules/tasks/modals/modal-create-task";

import { Archived } from "@/components/archived";
import { ButtonArchive } from "@/components/buttons/button-archive";
import { CtasWrapper } from "@/components/cta-wrapper";
import { Renderer } from "@/components/renderer";
import { useLayout } from "@/layout/layout-context";
import { OnModalCreateBooking } from "@/modules/bookings/modals/modal-create-booking";
import { CustomerKyc } from "@/modules/customers/customer-kyc-list";
import { t } from "@/modules/lang/lang-service";
import { OnModalPrescriptionForm } from "@/modules/prescriptions/modal-prescription-form";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";

export const CustomerDetail = () => {
  const workspace = useWorkspace();
  const layout = useLayout();

  const params = useParams();
  const customerCode = params.code as string;

  const detail = useFetch<CustomerEntity>({
    id: `customers-${customerCode}`,
    fetch: async () => {
      return getCustomerByCode(customerCode);
    },
    events: {
      types: [EventType.CUSTOMER_UPDATED],
      condition: (e, data) => data?._id === e.ref || (e.relatedEntities || []).some((v) => v.id === data?._id),
    },
  });

  const { data: customer } = detail;

  useEffect(() => {
    if (customer) {
      layout.setComponents({
        head: customer.name,
        navigation: (
          <>
            {workspace.hasPermission(WorkspacePermission.BOOKING_MANAGER) && (
              <Button
                leftIcon={IconCalendarPlus}
                variant="outline"
                onClick={() => OnModalCreateBooking({ customer })}
                size="xs"
              >
                {t("booking")}
              </Button>
            )}

            <Button
              leftIcon={IconStackPush}
              variant="outline"
              onClick={() => OnModalCreateTask({ customer })}
              size="xs"
            >
              {t("task")}
            </Button>
          </>
        ),
      });
    }
  }, [customer, workspace.permissions]);

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
  if (customer.isArchived) return <Archived entity="customer" />;

  return (
    <>
      <Stack gap={30} p={16}>
        <CustomerInformations customer={customer} />

        <Renderer visible={workspace.isModuleActive("customerKYCs")}>
          <Stack gap={10}>
            <SessionTitle name={t("customerKYCs")} icon={IconUserScan} />
            <CustomerKyc customer={customer} />
          </Stack>
        </Renderer>

        <Renderer visible={workspace.isModuleActive("bookings")}>
          <CustomerBookings customer={customer} />
        </Renderer>

        <Renderer visible={workspace.isModuleActive("tasks")}>
          <CustomerTasks customer={customer} />
        </Renderer>

        <Stack gap={10}>
          <SessionTitle name={t("imgs_docs")} icon={IconFiles} />

          <FilesBox
            query={{ relatedCustomerId: customer._id }}
            autoUpload
            specificDisabledRelated={["relatedReceiptId"]}
          />
        </Stack>

        <EventList ref={customer._id} />

        <ButtonArchive
          name="customer"
          enabled={!customer.isArchived && workspace.hasPermission(WorkspacePermission.CUSTOMERS_ARCHIVE)}
          process={() => archiveCustomer(customer._id)}
        />
      </Stack>

      <CtasWrapper>
        <Renderer visible={workspace.isModuleActive("prescriptions")}>
          <ActionIcon radius={150} size="xl" color="orange" onClick={() => OnModalPrescriptionForm({ customer })}>
            <IconPill strokeWidth={1.5} />
          </ActionIcon>
        </Renderer>

        <Comments customer={customer} />
      </CtasWrapper>
    </>
  );
};
