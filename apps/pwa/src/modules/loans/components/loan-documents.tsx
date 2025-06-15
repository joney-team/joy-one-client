"use client";

import { Button } from "@/components/buttons/button";
import { Image } from "@/components/image";
import { LoanAssetDataInput } from "@/modules/loans/components/loan-asset-data-inputs";
import { Renderer } from "@/components/renderer";
import { SessionTitle } from "@/components/session-title";
import { OnModalFileGallery } from "@/modules/files/modals/modal-file-gallery";
import { OnModalPrompt } from "@/modals/modal-prompt";
import { FileType } from "@/modules/files/file-types";
import { num, t } from "@/modules/lang/lang-service";
import {
  approveLoan,
  rejectLoan,
  renderLoanPeriod,
  updateLoanAmount,
  updateLoanPackage,
} from "@/modules/loans/loans-service";
import { LoanEntity, LoanStatus } from "@/modules/loans/loans-types";
import { getGoogleMapLinkCoord } from "@/modules/locations/locations-service";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onActionLoad } from "@/utils/actions";
import { onError } from "@/utils/exceptions.utils";
import { StringUtils } from "@/utils/string.utils";
import {
  Anchor,
  Badge,
  Card,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  ThemeIcon,
  useMantineTheme,
} from "@mantine/core";
import { useDebouncedCallback, useHover } from "@mantine/hooks";
import {
  IconArrowsDiagonal,
  IconCheck,
  IconClipboard,
  IconClipboardCheck,
  IconClipboardText,
  IconNotes,
} from "@tabler/icons-react";
import { FC } from "react";
import { LoanRowInfo } from "./loan-row-info";

interface LoanDocumentsProps {
  loan: LoanEntity;
  updateAssetData: (assetData: any) => void;
}

export const LoanDocuments: FC<LoanDocumentsProps> = (props) => {
  const { loan } = props;
  const workspace = useWorkspace();
  const ableToUpdate =
    loan.status === LoanStatus.PENDING &&
    workspace.hasPermission(WorkspacePermission.LOANS_CREATOR);

  const onUpdateAmount = useDebouncedCallback(async (value: any) => {
    onActionLoad({
      name: t("update_loan_amount"),
      process: () => updateLoanAmount(loan.id, { amount: +value }).catch(onError),
    });
  }, 300);

  const onUpdatePackagePeriodDays = useDebouncedCallback(async (v: any) => {
    onActionLoad({
      name: t("update_loan_payment_period"),
      process: () =>
        updateLoanPackage(loan.id, { packagePeriodDays: +v, packageId: loan.package.id }).catch(
          onError
        ),
    });
  }, 300);

  const onReject = async () => {
    OnModalPrompt({
      title: StringUtils.capitalizeFirstLetter(`${t("reject")} ${t("loan")}`),
      message: t("enter_reject_reason"),
      onSubmit: (reason) => rejectLoan(loan.id, { reason }),
      icon: IconClipboard,
      color: "red",
      suggestions: [t("wrong_information"), t("info_does_not_match_img"), t("img_is_blurry")],
    });
  };

  const onApprove = async () => {
    await onActionLoad({
      name: t("approve"),
      icon: IconClipboardCheck,
      process: async () => {
        await approveLoan(loan.id);
      },
    });
  };

  return (
    <Stack gap={30}>
      <SessionTitle mb={-20} name={t("loan")} icon={IconNotes} />

      <Card className="LoanDetailDoc" shadow="xs">
        <Stack>
          <LoanRowInfo label={t("loan_package")} value={loan.package.id} />

          <LoanRowInfo
            label={t("loan_asset_type")}
            value={t(`loan_asset_type_${loan.assetType}`)}
          />

          <LoanRowInfo label={t("loan_period")} value={renderLoanPeriod(loan.package.days)} />

          <LoanRowInfo
            label={t("loan_amount")}
            value={
              ableToUpdate ? (
                <NumberInput
                  hideControls
                  defaultValue={loan.amount}
                  onChange={(v) => onUpdateAmount(+v)}
                />
              ) : (
                num(loan.amount, { type: "money" })
              )
            }
          />

          <LoanRowInfo
            label={t("loan_payment_periods")}
            value={
              ableToUpdate ? (
                <Select
                  data={loan.package.periodDaysOptions.map((value) => ({
                    value: value.toString(),
                    label: renderLoanPeriod(value),
                  }))}
                  value={loan.packagePeriodDays.toString()}
                  onChange={(v) => onUpdatePackagePeriodDays(v)}
                />
              ) : (
                num(loan.packagePeriodDays)
              )
            }
          />

          <LoanRowInfo label={t("signature")} value={<SignareCard url={loan.signature} />} />

          <LoanRowInfo
            label={t("loan_coord")}
            description={t("loan_coord_desc")}
            value={
              loan.coord ? (
                <Anchor href={getGoogleMapLinkCoord(loan.coord)} target="_blank">
                  {t("view_on_google_map")}
                </Anchor>
              ) : (
                "--"
              )
            }
          />

          {loan.status === LoanStatus.REJECTED && (
            <Stack align="center" gap={5} mt={16}>
              <Badge color="red">{t("rejected")}</Badge>

              <Text c="red">{loan.rejectReason}</Text>
            </Stack>
          )}
        </Stack>
      </Card>

      <SessionTitle mb={-20} name={t("loan_asset_data")} icon={IconClipboardText} />
      <Card shadow="xs">
        <LoanAssetDataInput
          assetType={loan.assetType}
          value={loan.assetData}
          disabled={!ableToUpdate}
          onChange={props.updateAssetData}
        />
      </Card>

      <Renderer
        visible={
          loan.status === LoanStatus.PENDING &&
          workspace.hasPermission(WorkspacePermission.LOANS_APPROVE)
        }
      >
        <Group justify="center">
          <Button onClick={onApprove} leftIcon={IconCheck}>
            {t("approve")}
          </Button>

          <Button variant="outline" color="gray" onClick={onReject}>
            {t("reject")}
          </Button>
        </Group>
      </Renderer>
    </Stack>
  );
};

export const SignareCard: FC<{ url: string }> = (props) => {
  const { url } = props;
  const theme = useMantineTheme();
  const hover = useHover();

  return (
    <Card
      withBorder
      shadow="none"
      w={200}
      p={5}
      style={{ position: "relative", overflow: "visible", cursor: "pointer" }}
    >
      <Stack w="100%" gap={5}>
        <Stack ref={hover.ref} style={{ position: "relative" }}>
          <Image src={url} w="100%" h={100} mih={100} mah={100} fit="contain" bg="gray.1" />

          {hover.hovered && (
            <Stack
              justify="center"
              align="center"
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                top: 0,
                left: 0,
                borderRadius: theme.defaultRadius,
              }}
              onClick={() => {
                OnModalFileGallery({
                  files: [{ url, fileName: t("signature"), type: FileType.PHOTO }],
                  disabled: true,
                  background: "white",
                });
              }}
            >
              <ThemeIcon color="white" variant="transparent" size="sm">
                <IconArrowsDiagonal />
              </ThemeIcon>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Card>
  );
};
