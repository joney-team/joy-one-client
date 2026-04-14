"use client";

import { WorkspaceType } from "@/graphql/enums.graphql";
import { type AppRouter, useRouter } from "@/hooks/use-router";
import { useLayout } from "@/layout/layout-context";
import { type ModalCreateBookingRef } from "@/modules/bookings/modals/modal-create-booking";
import { type ModalCustomerRef } from "@/modules/customers/customer-modal";
import { type ModalCreateLoanRef } from "@/modules/loans/modals/modal-create-loan";
import { type ModalCreateTaskRef } from "@/modules/tasks/modals/modal-create-task";
import { useColor } from "@/modules/theme/use-color";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import {
  useAvailableWorkspaceModules,
  WorkspaceModuleId,
} from "@/modules/workspaces/workspace-modules";
import { nonLoading } from "@/utils/non-loading";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Group, Menu } from "@mantine/core";
import {
  Icon,
  IconBolt,
  IconCalculator,
  IconCalendarPlus,
  IconClipboardPlus,
  IconCreditCardPay,
  IconPlus,
  IconStackPush,
  IconUserPlus,
} from "@tabler/icons-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { type FC, Fragment, useRef } from "react";
import { Button } from "../../components/buttons/button";

const ModalLoanCalculator = dynamic(
  () =>
    import("@/modules/loans/modals/modal-loan-calculator").then((mod) => mod.ModalLoanCalculator),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const ModalCustomer = dynamic(
  () => import("@/modules/customers/customer-modal").then((mod) => mod.ModalCustomer),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const ModalCreateBooking = dynamic(
  () =>
    import("@/modules/bookings/modals/modal-create-booking").then((mod) => mod.ModalCreateBooking),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const ModalCreateLoan = dynamic(
  () => import("@/modules/loans/modals/modal-create-loan").then((mod) => mod.ModalCreateLoan),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const ModalCreateTask = dynamic(
  () => import("@/modules/tasks/modals/modal-create-task").then((mod) => mod.ModalCreateTask),
  {
    ssr: false,
    loading: nonLoading,
  },
);
type ShortcutModals = {
  createLoan: () => void;
  createBooking: () => void;
  createTask: () => void;
  createCustomer: () => void;
};

type Shortcut = {
  icon: Icon;
  permission?: WorkspacePermission;
  moduleId?: WorkspaceModuleId;
  workspaceType?: WorkspaceType;
} & (
  | {
      onClick: (context: { router: AppRouter; modals: ShortcutModals }) => void;
    }
  | { href: string }
);

const shortcuts: Shortcut[] = [
  {
    icon: IconCreditCardPay,
    moduleId: "loans",
    workspaceType: WorkspaceType.Credit,
    permission: WorkspacePermission.LOANS_CREATOR,
    onClick: (context) => {
      context.modals.createLoan();
    },
  },
  {
    icon: IconUserPlus,
    moduleId: "customers",
    permission: WorkspacePermission.CUSTOMERS_CREATE,
    onClick: (context) => {
      context.modals.createCustomer();
    },
  },
  {
    moduleId: "orders",
    permission: WorkspacePermission.ORDERS_CREATE,
    icon: IconClipboardPlus,
    href: "/orders/sale?mode=new",
  },
  {
    moduleId: "tasks",
    icon: IconStackPush,
    onClick: (context) => {
      context.modals.createTask();
    },
  },
  {
    moduleId: "bookings",
    permission: WorkspacePermission.BOOKING_MANAGER,
    icon: IconCalendarPlus,
    onClick: (context) => {
      context.modals.createBooking();
    },
  },
];

export const WorkspaceHeaderShortcutsContent: FC<{ modals: ShortcutModals }> = ({ modals }) => {
  const workspace = useWorkspace();
  const { isModuleAvailable, getModule } = useAvailableWorkspaceModules();
  const layout = useLayout();
  const router = useRouter();
  const color = useColor();

  const availableShortcuts = shortcuts.filter((shortcut) => {
    const isHasPermission = !shortcut.permission || workspace.hasPermission(shortcut.permission);
    const isModuleActive = shortcut.moduleId ? !!isModuleAvailable(shortcut.moduleId) : true;
    const isMatchWorkspaceType = shortcut.workspaceType
      ? workspace.type === shortcut.workspaceType
      : true;
    return isHasPermission && isModuleActive && isMatchWorkspaceType;
  });

  if (layout.view === "mobile") {
    if (availableShortcuts.length === 0) return null;
    return (
      <Menu>
        <Menu.Target>
          <ActionIcon radius={100}>
            <IconPlus size={18} />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          {availableShortcuts.map((shortcut) => {
            const workspaceModule = getModule(shortcut.moduleId as string);
            if (!workspaceModule) return null;

            if ("onClick" in shortcut) {
              return (
                <Menu.Item
                  key={workspaceModule.id}
                  leftSection={<shortcut.icon size={18} />}
                  onClick={() => shortcut.onClick({ router, modals })}
                >
                  {workspaceModule.name}
                </Menu.Item>
              );
            }
            return (
              <Menu.Item
                key={workspaceModule.id}
                leftSection={<shortcut.icon size={18} />}
                component={Link}
                href={shortcut.href}
              >
                {workspaceModule.name}
              </Menu.Item>
            );
          })}
        </Menu.Dropdown>
      </Menu>
    );
  }

  return (
    <Group gap={0}>
      {workspace.type === WorkspaceType.Credit && (
        <ModalLoanCalculator>
          {(open) => (
            <Button
              id="create-credit"
              variant="subtle"
              size="xs"
              onClick={open}
              leftIcon={IconCalculator}
              px={6}
            >
              <Trans>Loan calculator</Trans>
            </Button>
          )}
        </ModalLoanCalculator>
      )}

      {availableShortcuts.length > 0 && (
        <Menu trigger="hover">
          <Menu.Target>
            <Group>
              <Button px={6} id="create-credit" size="xs" leftIcon={IconBolt} variant="subtle">
                <Trans>Quick Creation</Trans>
              </Button>
            </Group>
          </Menu.Target>

          <Menu.Dropdown>
            {availableShortcuts.map((shortcut) => {
              const workspaceModule = getModule(shortcut.moduleId as string);
              if (!workspaceModule) return null;

              if ("onClick" in shortcut) {
                return (
                  <Menu.Item
                    key={workspaceModule.id}
                    leftSection={<shortcut.icon size={16} />}
                    onClick={() => shortcut.onClick({ router, modals })}
                  >
                    {workspaceModule.name}
                  </Menu.Item>
                );
              }
              return (
                <Menu.Item
                  key={workspaceModule.id}
                  leftSection={<shortcut.icon size={16} />}
                  component={Link}
                  href={shortcut.href}
                >
                  {workspaceModule.name}
                </Menu.Item>
              );
            })}
          </Menu.Dropdown>
        </Menu>
      )}
    </Group>
  );
};

export const WorkspaceHeaderShortcuts: FC = () => {
  const modalCreateTaskRef = useRef<ModalCreateTaskRef>(null);
  const modalCreateLoanRef = useRef<ModalCreateLoanRef>(null);
  const modalCreateBookingRef = useRef<ModalCreateBookingRef>(null);
  const modalCustomerRef = useRef<ModalCustomerRef>(null);

  return (
    <Fragment>
      <WorkspaceHeaderShortcutsContent
        modals={{
          createLoan: () => modalCreateLoanRef.current?.open(),
          createBooking: () => modalCreateBookingRef.current?.open(),
          createTask: () => modalCreateTaskRef.current?.open(),
          createCustomer: () => modalCustomerRef.current?.open(),
        }}
      />

      <ModalCustomer ref={modalCustomerRef} />
      <ModalCreateBooking ref={modalCreateBookingRef} />
      <ModalCreateLoan ref={modalCreateLoanRef} />
      <ModalCreateTask ref={modalCreateTaskRef} />
    </Fragment>
  );
};
