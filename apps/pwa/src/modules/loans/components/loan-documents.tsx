"use client";

import { Button } from "@/components/buttons/button";
import { Container } from "@/components/container";
import { CurrencyFormat } from "@/components/format/currency-format";
import { NumberFormat } from "@/components/format/number-format";
import { Image } from "@/components/image";
import { Renderer } from "@/components/renderer";
import { SectionTitle } from "@/components/session-title";
import { FileType } from "@/graphql/enums.graphql";
import { OnModalPrompt } from "@/modals/modal-prompt";
import { ModalFileGallery } from "@/modules/files/modals/modal-file-gallery";
import { LoanAssetDataInput } from "@/modules/loans/components/loan-asset-data-inputs";
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
import { t } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
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
import { FC, ReactNode } from "react";
import { loanAssetTypes } from "../loans-constants";
import { LoanRowInfo } from "./loan-row-info";

interface LoanDocumentsProps {
  loan: LoanEntity;
  updateAssetData: (assetData: any) => void;
  children?: ReactNode;
}

export const LoanDocuments: FC<LoanDocumentsProps> = (props) => {
  const { t } = useLingui();
  const { loan } = props;
  const workspace = useWorkspace();

  const ableToUpdate =
    loan.status === LoanStatus.PENDING &&
    workspace.hasPermission(WorkspacePermission.LOANS_CREATOR);

  const onUpdateAmount = useDebouncedCallback(async (value: any) => {
    onActionLoad({
      name: <Trans>Update loan amount</Trans>,
      process: () => updateLoanAmount(loan.id, { amount: +value }).catch(onError),
    });
  }, 300);

  const onUpdatePackagePeriodDays = useDebouncedCallback(async (v: any) => {
    onActionLoad({
      name: <Trans>Update loan payment period</Trans>,
      process: () =>
        updateLoanPackage(loan.id, { packagePeriodDays: +v, packageId: loan.package.id }).catch(
          onError
        ),
    });
  }, 300);

  const onReject = async () => {
    OnModalPrompt({
      title: <Trans>Reject loan</Trans>,
      message: <Trans>Enter reject reason</Trans>,
      onSubmit: (reason) => rejectLoan(loan.id, { reason }),
      icon: IconClipboard,
      color: "red",
      suggestions: [t`Wrong information`, t`Info does not match image`, t`Img is blurry`],
    });
  };

  const onApprove = async () => {
    await onActionLoad({
      name: <Trans>Approve</Trans>,
      icon: IconClipboardCheck,
      process: async () => {
        await approveLoan(loan.id);
      },
    });
  };

  return (
    <Stack gap={30} w="100%">
      <SectionTitle mb={-20} name={<Trans>Loan</Trans>} icon={IconNotes} />

      <Card className="LoanDetailDoc" shadow="xs">
        <Stack>
          <LoanRowInfo label={<Trans>Loan package</Trans>} value={loan.package.id} />

          <LoanRowInfo
            label={<Trans>Loan asset type</Trans>}
            value={t(loanAssetTypes[loan.assetType].label)}
          />

          <LoanRowInfo
            label={<Trans>Loan period</Trans>}
            value={renderLoanPeriod(loan.package.days)}
          />

          <LoanRowInfo
            label={<Trans>Loan amount</Trans>}
            value={loan.amount}
            renderValue={() =>
              ableToUpdate ? (
                <NumberInput
                  hideControls
                  defaultValue={loan.amount}
                  onChange={(v) => onUpdateAmount(+v)}
                />
              ) : (
                <CurrencyFormat value={loan.amount} />
              )
            }
          />

          <LoanRowInfo
            label={<Trans>Loan payment periods</Trans>}
            value={loan.packagePeriodDays}
            renderValue={() =>
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
                <NumberFormat value={loan.packagePeriodDays} />
              )
            }
          />

          <LoanRowInfo
            label={<Trans>Signature</Trans>}
            value={loan.signature}
            renderValue={(value) => <SignareCard url={value} />}
          />

          <LoanRowInfo
            label={<Trans>Customer location</Trans>}
            description={t`At the time of loan signing`}
            value={loan.coord}
            renderValue={(value) => (
              <Anchor href={value ? getGoogleMapLinkCoord(value) : undefined} target="_blank">
                {<Trans>View on Google Map</Trans>}
              </Anchor>
            )}
          />

          {loan.status === LoanStatus.REJECTED && (
            <Stack align="center" gap={5} mt={16}>
              <Badge color="red">{<Trans>Rejected</Trans>}</Badge>

              {loan.rejectReason && <Text c="red">{loan.rejectReason}</Text>}
            </Stack>
          )}
        </Stack>
      </Card>

      <SectionTitle mb={-20} name={<Trans>Asset data</Trans>} icon={IconClipboardText} />
      <Card shadow="xs">
        <LoanAssetDataInput
          loanId={loan.id}
          assetType={loan.assetType}
          value={loan.assetData}
          disabled={!ableToUpdate}
          onChange={props.updateAssetData}
        />
      </Card>

      {props.children}

      <Renderer
        visible={
          loan.status === LoanStatus.PENDING &&
          workspace.hasPermission(WorkspacePermission.LOANS_APPROVE)
        }
      >
        <Group justify="center">
          <Button onClick={onApprove} leftIcon={IconCheck}>
            {<Trans>Approve</Trans>}
          </Button>

          <Button variant="outline" color="gray" onClick={onReject}>
            {<Trans>Reject</Trans>}
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
    <ModalFileGallery>
      {(openGallery) => (
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
                    openGallery({
                      files: [{ url, fileName: t`Signature`, type: FileType.Photo }],
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
      )}
    </ModalFileGallery>
  );
};
