import { Container } from "@/components/container";
import { SectionTitle } from "@/components/session-title";
import { WorkspaceSettingImportLoans } from "@/modules/workspace-settings/components/workspace-setting-import-loans";
import { WorkspacetSettingLoans } from "@/modules/workspace-settings/components/workspace-setting-loans";
import { t } from "@lingui/core/macro";
import { Card, Stack } from "@mantine/core";
import { IconCreditCardPay, IconFileImport, IconReportMoney } from "@tabler/icons-react";
import { type FC } from "react";
import { WorkspaceSettingCreditOperation } from "./components/workspace-setting-credit-operation";
import { Trans } from "@lingui/react/macro";

export const WorkspaceSettingCredit: FC = () => {
  return (
    <Container p="md">
      <Stack gap={30}>
        <Stack gap={8}>
          <SectionTitle name={<Trans>Credit</Trans>} icon={IconReportMoney} />
          <Card shadow="xs">
            <WorkspaceSettingCreditOperation />
          </Card>
        </Stack>

        <Stack gap={8}>
          <SectionTitle name={<Trans>Import loan data</Trans>} icon={IconFileImport} />
          <Card shadow="xs">
            <WorkspaceSettingImportLoans />
          </Card>
        </Stack>

        <Stack gap={8}>
          <SectionTitle name={<Trans>Loan package</Trans>} icon={IconCreditCardPay} />
          <Card shadow="xs">
            <WorkspacetSettingLoans />
          </Card>
        </Stack>
      </Stack>
    </Container>
  );
};
