import { type FC } from "react";
import { WorkspacetSettingLoans } from "@/modules/workspace-settings/components/workspace-setting-loans";
import { Container } from "@/components/container";
import { SessionTitle } from "@/components/session-title";
import { Card, Stack } from "@mantine/core";
import { IconCreditCardPay, IconFileImport, IconReportMoney } from "@tabler/icons-react";
import { WorkspaceSettingImportLoans } from "@/modules/workspace-settings/components/workspace-setting-import-loans";
import { WorkspaceSettingCreditOperation } from "./components/workspace-setting-credit-operation";

export const WorkspaceSettingCredit: FC = () => {
  return (
    <Container p={16}>
      <Stack gap={30}>
        <Stack gap={8}>
          <SessionTitle name="Tín dụng" icon={IconReportMoney} />
          <Card shadow="xs">
            <WorkspaceSettingCreditOperation />
          </Card>
        </Stack>

        <Stack gap={8}>
          <SessionTitle name="Nhập dữ liệu hồ sơ vay" icon={IconFileImport} />
          <Card shadow="xs">
            <WorkspaceSettingImportLoans />
          </Card>
        </Stack>

        <Stack gap={8}>
          <SessionTitle name="Gói vay" icon={IconCreditCardPay} />
          <Card shadow="xs">
            <WorkspacetSettingLoans />
          </Card>
        </Stack>
      </Stack>
    </Container>
  );
};
