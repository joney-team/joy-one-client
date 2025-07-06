"use client";

import { LoanSettings } from "@/modules/loans/loans-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Grid, NumberInput, Switch, TextInput } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { FC } from "react";

export const WorkspaceSettingCreditOperation: FC = () => {
  const workspace = useWorkspace();

  const onChange = useDebouncedCallback((key: keyof LoanSettings, value: any) => {
    workspace.setSettings({
      ...workspace.settings,
      loanSettings: {
        ...workspace.settings.loanSettings,
        [key]: value,
      },
    });
  }, 500);

  return (
    <Grid>
      {workspace.isShouldEnableBranches && (
        <Grid.Col span={12}>
          <Switch
            label="Tự động chọn chi nhánh khi tạo hợp đồng"
            defaultChecked={workspace.settings.loanSettings?.isAutoSelectWorkspaceBranch}
            onChange={(e) => {
              onChange("isAutoSelectWorkspaceBranch", e.target.checked);
            }}
          />
        </Grid.Col>
      )}

      <Grid.Col span={6}>
        <NumberInput
          label="Tỷ lệ chênh lệch định giá (0 - 100)"
          min={0}
          max={100}
          value={workspace.settings.loanSettings?.assetEstimationPriceSpreadRate}
          onChange={(e) => {
            onChange("assetEstimationPriceSpreadRate", e);
          }}
        />
      </Grid.Col>

      <Grid.Col span={6}>
        <NumberInput
          label="Cảnh báo trước ngày thanh toán (ngày)"
          min={0}
          max={100}
          value={workspace.settings.loanSettings?.warningReceiptBeforeDays}
          onChange={(e) => {
            onChange("warningReceiptBeforeDays", e);
          }}
        />
      </Grid.Col>

      <Grid.Col span={12}>
        <TextInput
          label="Link file hợp đồng PDF"
          defaultValue={workspace.settings.loanSettings?.contractPdfUrl}
          onBlur={(e) => {
            onChange("contractPdfUrl", e.target.value);
          }}
        />
      </Grid.Col>

      <Grid.Col span={12}>
        <TextInput
          label="Link file hợp đồng thanh lý PDF"
          defaultValue={workspace.settings.loanSettings?.contractLiquidationPdfUrl}
          onBlur={(e) => {
            onChange("contractLiquidationPdfUrl", e.target.value);
          }}
        />
      </Grid.Col>

      <Grid.Col span={12}>
        <TextInput
          label="Link file hóa đơn PDF"
          defaultValue={workspace.settings.loanSettings?.receiptPdfUrl}
          onBlur={(e) => {
            onChange("receiptPdfUrl", e.target.value);
          }}
        />
      </Grid.Col>

      <Grid.Col span={12}>
        <Switch
          label="Tự động xoá hồ sơ vay không được duyệt"
          defaultChecked={workspace.settings.loanSettings?.isAutoArchivePendingLoans}
          onChange={(e) => {
            onChange("isAutoArchivePendingLoans", e.target.checked);
          }}
        />
      </Grid.Col>
    </Grid>
  );
};
