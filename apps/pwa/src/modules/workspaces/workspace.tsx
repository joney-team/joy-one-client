"use client";

import { ButtonArchive } from "@/components/buttons/button-archive";
import { Container } from "@/components/container";
import { EventList } from "@/components/event-list";
import { Renderer } from "@/components/renderer";
import { SessionTitle } from "@/components/session-title";
import { EventType } from "@/modules/events/event-types";
import { tl } from "@/modules/lang/lang-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { WorkspaceType } from "@/modules/workspaces/workspaces-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { WorkspaceAppSettings } from "@/modules/workspace-settings/components/workspace-setting-app";
import { WorkspaceOperationSettings } from "@/modules/workspace-settings/components/workspace-setting-operation";
import { WorkspaceSettingCreditOperation } from "@/modules/workspace-settings/components/workspace-setting-credit-operation";
import { WorkspaceTermsAndPolicies } from "@/modules/workspace-settings/components/workspace-setting-terms-and-policies";
import { WorkspacetSettingLoans } from "@/modules/workspace-settings/components/workspace-setting-loans";
import { Card, Stack } from "@mantine/core";
import {
  IconApps,
  IconCreditCardPay,
  IconNotebook,
  IconReportMoney,
  IconSettings,
} from "@tabler/icons-react";
import { FC } from "react";
import { WorkspaceInformation } from "./components/workspace-information";

export const Workspace: FC = () => {
  const workspace = useWorkspace();

  return (
    <Container p={16}>
      <Stack gap={30}>
        <Card shadow="xs">
          <WorkspaceInformation />
        </Card>

        <Renderer visible={workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS)}>
          <Renderer visible={workspace.type === WorkspaceType.CREDIT}>
            <SessionTitle mb={-20} name="Tín dụng" icon={IconReportMoney} />
            <Card shadow="xs">
              <WorkspaceSettingCreditOperation />
            </Card>

            <SessionTitle mb={-20} name="Gói vay" icon={IconCreditCardPay} />
            <Card shadow="xs">
              <WorkspacetSettingLoans />
            </Card>
          </Renderer>

          <SessionTitle mb={-20} name={tl("operation-settings")} icon={IconSettings} />
          <Card shadow="xs">
            <WorkspaceOperationSettings />
          </Card>

          <SessionTitle mb={-20} name={tl("app-settings")} icon={IconApps} />
          <Card shadow="xs">
            <WorkspaceAppSettings />
          </Card>

          <SessionTitle mb={-20} name={tl("terms-and-policies")} icon={IconNotebook} />
          <Card shadow="xs">
            <WorkspaceTermsAndPolicies />
          </Card>

          <EventList type={EventType.WORKSPACE_SETTING_UPDATED} />

          <ButtonArchive
            mt={16}
            name="workspace"
            enabled={workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS)}
            process={() => workspace.archive()}
          />
        </Renderer>
      </Stack>
    </Container>
  );
};
