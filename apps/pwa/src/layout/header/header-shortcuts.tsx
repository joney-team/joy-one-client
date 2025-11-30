"use client";

import { type AppRouter, useRouter } from "@/hooks/use-router";
import { useLayout } from "@/layout/layout-context";
import { ModalCreateBooking } from "@/modules/bookings/modals/modal-create-booking";
import { ModalCustomer } from "@/modules/customers/customer-modal";
import { ModalCreateLoan } from "@/modules/loans/modals/modal-create-loan";
import { ModalLoanCalculator } from "@/modules/loans/modals/modal-loan-calculator";
import { ModalCreateTask } from "@/modules/tasks/modals/modal-create-task";
import { useColor } from "@/modules/theme/use-color";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import {
  useAvailableWorkspaceModules,
  WorkspaceModuleId,
} from "@/modules/workspaces/workspace-modules";
import { WorkspaceType } from "@/modules/workspaces/workspaces-types";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Group, Menu } from "@mantine/core";
import {
  Icon,
  IconCalculator,
  IconCalendarPlus,
  IconCirclePlus,
  IconClipboardPlus,
  IconCreditCardPay,
  IconPlus,
  IconStackPush,
  IconUserPlus,
} from "@tabler/icons-react";
import Link from "next/link";
import { type FC, Fragment } from "react";
import { Button } from "../../components/buttons/button";

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
    workspaceType: WorkspaceType.CREDIT,
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
          <ActionIcon radius={100} color={color("primary")}>
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
    <Fragment>
      {workspace.type === WorkspaceType.CREDIT && (
        <ModalLoanCalculator>
          {(open) => (
            <Button
              id="create-credit"
              variant="outline"
              size="xs"
              onClick={open}
              leftIcon={IconCalculator}
            >
              <Trans>Loan calculator</Trans>
            </Button>
          )}
        </ModalLoanCalculator>
      )}

      {availableShortcuts.length > 0 && (
        <Menu>
          <Menu.Target>
            <Group>
              <Button id="create-credit" size="xs" leftIcon={IconCirclePlus} isGradient>
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
      )}
    </Fragment>
  );
};

export const WorkspaceHeaderShortcuts: FC = () => {
  return (
    <ModalCreateBooking>
      {(openModalCreateBooking) => (
        <ModalCreateTask>
          {(openModalCreateTask) => (
            <ModalCreateLoan>
              {(openModalCreateLoan) => (
                <ModalCustomer>
                  {(openModalCustomer) => (
                    <WorkspaceHeaderShortcutsContent
                      modals={{
                        createLoan: () => openModalCreateLoan(),
                        createBooking: () => openModalCreateBooking(),
                        createTask: () => openModalCreateTask(),
                        createCustomer: () => openModalCustomer(),
                      }}
                    />
                  )}
                </ModalCustomer>
              )}
            </ModalCreateLoan>
          )}
        </ModalCreateTask>
      )}
    </ModalCreateBooking>
  );
};
