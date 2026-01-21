"use client";

import { ButtonArchive } from "@/components/buttons/button-archive";
import { Container } from "@/components/container";
import { Renderer } from "@/components/renderer";
import { SectionTitle } from "@/components/session-title";
import { EventType, WorkspaceType } from "@/graphql/enums.graphql";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { WorkspaceAppSettings } from "@/modules/workspace-settings/components/workspace-setting-app";
import { WorkspaceSettingCreditOperation } from "@/modules/workspace-settings/components/workspace-setting-credit-operation";
import { WorkspacetSettingLoans } from "@/modules/workspace-settings/components/workspace-setting-loans";
import { WorkspaceOperationSettings } from "@/modules/workspace-settings/components/workspace-setting-operation";
import { WorkspaceTermsAndPolicies } from "@/modules/workspace-settings/components/workspace-setting-terms-and-policies";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Trans } from "@lingui/react/macro";
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
import dynamic from "next/dynamic";
import { nonLoading } from "@/utils/non-loading";

const EventsList = dynamic(
  () => import("@/modules/events/events-list").then((mod) => mod.EventsList),
  {
    ssr: false,
    loading: nonLoading,
  }
);

export const Workspace: FC = () => {
  const workspace = useWorkspace();

  return (
    <Container p={16}>
      <Stack gap={30}>
        <Card shadow="xs">
          <WorkspaceInformation />
        </Card>

        <Renderer visible={workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS)}>
          <Renderer visible={workspace.type === WorkspaceType.Credit}>
            <SectionTitle mb={-20} name={<Trans>Credit</Trans>} icon={IconReportMoney} />
            <Card shadow="xs">
              <WorkspaceSettingCreditOperation />
            </Card>

            <SectionTitle mb={-20} name={<Trans>Loan package</Trans>} icon={IconCreditCardPay} />
            <Card shadow="xs">
              <WorkspacetSettingLoans />
            </Card>
          </Renderer>

          <SectionTitle mb={-20} name={<Trans>Operation settings</Trans>} icon={IconSettings} />
          <Card shadow="xs">
            <WorkspaceOperationSettings />
          </Card>

          <SectionTitle mb={-20} name={<Trans>App settings</Trans>} icon={IconApps} />
          <Card shadow="xs">
            <WorkspaceAppSettings />
          </Card>

          <SectionTitle mb={-20} name={<Trans>Terms and policies</Trans>} icon={IconNotebook} />
          <Card shadow="xs">
            <WorkspaceTermsAndPolicies />
          </Card>

          <EventsList type={EventType.WorkspaceSettingUpdated} />

          <ButtonArchive
            mt={16}
            name="Workspace"
            enabled={workspace.hasPermission(WorkspacePermission.WORKSPACE_SETTINGS)}
            process={() => workspace.archive()}
          />
        </Renderer>
      </Stack>
    </Container>
  );
};
