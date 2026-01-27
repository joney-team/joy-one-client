"use client";

import { LoanSettingsInput } from "@/graphql/types.graphql";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onError } from "@/utils/exceptions.utils";
import { Grid, NumberInput, Switch, TextInput } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { FC } from "react";
import { useWorkspaceSetting } from "../hooks/use-workspace-setting";

export const WorkspaceSettingCreditOperation: FC = () => {
  const workspace = useWorkspace();
  const { workspaceSetting, updateWorkspaceSetting } = useWorkspaceSetting();

  const onChange = useDebouncedCallback((key: keyof LoanSettingsInput, value: any) => {
    if (!workspaceSetting) return;
    updateWorkspaceSetting({
      loanSettings: {
        ...workspaceSetting.loanSettings!,
        loanPackages: workspaceSetting.loanSettings?.loanPackages ?? [],
        [key]: value ?? null,
      },
    }).catch(onError);
  }, 500);

  if (!workspaceSetting) return null;

  return (
    <Grid>
      <Grid.Col span={6}>
        <NumberInput
          label="Tỷ lệ chênh lệch định giá (0 - 100)"
          min={0}
          max={100}
          value={workspaceSetting.loanSettings?.assetEstimationPriceSpreadRate ?? undefined}
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
          value={workspaceSetting.loanSettings?.warningReceiptBeforeDays ?? undefined}
          onChange={(e) => {
            onChange("warningReceiptBeforeDays", e);
          }}
        />
      </Grid.Col>

      <Grid.Col span={12}>
        <TextInput
          label="Link file hợp đồng PDF"
          defaultValue={workspaceSetting.loanSettings?.contractPdfUrl ?? ""}
          onBlur={(e) => {
            onChange("contractPdfUrl", e.target.value);
          }}
        />
      </Grid.Col>

      <Grid.Col span={12}>
        <TextInput
          label="Link file hợp đồng thanh lý PDF"
          defaultValue={workspaceSetting.loanSettings?.contractLiquidationPdfUrl ?? ""}
          onBlur={(e) => {
            onChange("contractLiquidationPdfUrl", e.target.value);
          }}
        />
      </Grid.Col>

      <Grid.Col span={12}>
        <TextInput
          label="Link file hóa đơn PDF"
          defaultValue={workspaceSetting.loanSettings?.receiptPdfUrl ?? ""}
          onBlur={(e) => {
            onChange("receiptPdfUrl", e.target.value);
          }}
        />
      </Grid.Col>

      {workspace.isShouldEnableBranches && (
        <Grid.Col span={12}>
          <Switch
            label="Tự động chọn chi nhánh khi tạo hợp đồng"
            defaultChecked={workspaceSetting.loanSettings?.isAutoSelectWorkspaceBranch ?? false}
            onChange={(e) => {
              onChange("isAutoSelectWorkspaceBranch", e.target.checked);
            }}
          />
        </Grid.Col>
      )}
    </Grid>
  );
};
