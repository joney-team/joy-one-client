"use client";

import { type AppRouter, useRouter } from "@/hooks/use-router";
import { useLayout } from "@/layout/layout-context";
import { OnModalCreateBooking } from "@/modules/bookings/modals/modal-create-booking";
import { OnCustomerModal } from "@/modules/customers/customer-modal";
import { t } from "@/modules/lang/lang-service";
import { OnModalCreateLoan } from "@/modules/loans/modals/modal-create-loan";
import { OnModalLoanCalculator } from "@/modules/loans/modals/modal-loan-calculator";
import { OnModalCreateTask } from "@/modules/tasks/modals/modal-create-task";
import { useColor } from "@/modules/theme/use-color";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { WorkspaceModuleId } from "@/modules/workspaces/workspace-modules";
import { WorkspaceType } from "@/modules/workspaces/workspaces-types";
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
import { type FC, Fragment, memo } from "react";
import { Button } from "../../components/buttons/button";

type Shortcut = {
  icon: Icon;
  permission?: WorkspacePermission;
  moduleId?: WorkspaceModuleId;
  workspaceType?: WorkspaceType;
} & ({ onClick: (router: AppRouter) => void } | { href: string });

const shortcuts: Shortcut[] = [
  {
    icon: IconCreditCardPay,
    moduleId: "loans",
    workspaceType: WorkspaceType.CREDIT,
    permission: WorkspacePermission.LOANS_CREATOR,
    onClick: () => OnModalCreateLoan(),
  },
  {
    icon: IconUserPlus,
    moduleId: "customers",
    permission: WorkspacePermission.CUSTOMERS_CREATE,
    onClick: (router: AppRouter) =>
      OnCustomerModal({
        onDone: (customer) => router.push(`/customers/${customer.code}`),
      }),
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
    onClick: () => OnModalCreateTask(),
  },
  {
    moduleId: "bookings",
    permission: WorkspacePermission.BOOKING_MANAGER,
    icon: IconCalendarPlus,
    onClick: () => OnModalCreateBooking(),
  },
];

export const WorkspaceHeaderShortcuts: FC = memo(() => {
  const workspace = useWorkspace();
  const layout = useLayout();
  const router = useRouter();
  const color = useColor();

  const availableShortcuts = shortcuts.filter((shortcut) => {
    const isHasPermission = !shortcut.permission || workspace.hasPermission(shortcut.permission);
    const isModuleActive = shortcut.moduleId ? workspace.isModuleActive(shortcut.moduleId) : true;
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
            const mod = workspace.modules.find((m) => m.id === shortcut.moduleId);
            if (!mod) return null;

            if ("onClick" in shortcut) {
              return (
                <Menu.Item
                  key={mod.id}
                  leftSection={<shortcut.icon size={18} />}
                  onClick={() => shortcut.onClick(router)}
                >
                  {mod.name}
                </Menu.Item>
              );
            }
            return (
              <Menu.Item
                key={mod.id}
                leftSection={<shortcut.icon size={18} />}
                component={Link}
                href={shortcut.href}
              >
                {mod.name}
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
        <Button
          id="create-credit"
          variant="outline"
          size="xs"
          onClick={() => OnModalLoanCalculator()}
          leftIcon={IconCalculator}
        >
          {t("loan-calculator")}
        </Button>
      )}

      {availableShortcuts.length > 0 && (
        <Menu>
          <Menu.Target>
            <Group>
              <Button id="create-credit" size="xs" leftIcon={IconCirclePlus} isGradient>
                {t("shortcut_new")}
              </Button>
            </Group>
          </Menu.Target>

          <Menu.Dropdown>
            {availableShortcuts.map((shortcut) => {
              const mod = workspace.modules.find((m) => m.id === shortcut.moduleId);
              if (!mod) return null;

              if ("onClick" in shortcut) {
                return (
                  <Menu.Item
                    key={mod.id}
                    leftSection={<shortcut.icon size={18} />}
                    onClick={() => shortcut.onClick(router)}
                  >
                    {mod.name}
                  </Menu.Item>
                );
              }
              return (
                <Menu.Item
                  key={mod.id}
                  leftSection={<shortcut.icon size={18} />}
                  component={Link}
                  href={shortcut.href}
                >
                  {mod.name}
                </Menu.Item>
              );
            })}
          </Menu.Dropdown>
        </Menu>
      )}
    </Fragment>
  );
});
