"use client";

import { Button } from "@/components/buttons/button";
import { Container } from "@/components/container";
import { EntityImage } from "@/components/entity-image";
import { Errored } from "@/components/errored";
import { EventList } from "@/components/event-list";
import { CurrencyFormat } from "@/components/format/currency-format";
import { DateFormat } from "@/components/format/date-format";
import { Renderer } from "@/components/renderer";
import { genders } from "@/constant";
import { useRouter } from "@/hooks/use-router";
import { useLayout } from "@/layout/layout-context";
import { getCustomerKyc } from "@/modules/customer-kycs/customer-kycs-service";
import { CustomerKycEntity, CustomerKycStatus } from "@/modules/customer-kycs/customer-kycs-types";
import { OnCustomerModal } from "@/modules/customers/customer-modal";
import { getCustomer } from "@/modules/customers/customer-service";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { useLoans } from "@/modules/loans/loans-context";
import { archiveLoan, getLoanByCode, updateLoanAssetData } from "@/modules/loans/loans-service";
import { LoanEntity, LoanStatus } from "@/modules/loans/loans-types";
import { OnModalSignLoan } from "@/modules/loans/modals/modal-sign-loan";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { renderEntityCode } from "@/modules/workspaces/utils";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onActionLoad, onArchive } from "@/utils/actions";
import { onError } from "@/utils/exceptions.utils";
import { formatPhoneNumber } from "@/utils/phone.utils";
import { useFetch } from "@/utils/use-fetch.util";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Anchor,
  Card,
  Center,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Stepper,
  Text,
  Title,
} from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import {
  IconAnalyze,
  IconArchive,
  IconClipboardCheck,
  IconClipboardText,
  IconCreditCardPay,
  IconEdit,
  IconFileTypePdf,
  IconLocation,
  IconPhone,
  IconShieldCheckered,
  IconUserScan,
} from "@tabler/icons-react";
import { NextPage } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FC, ReactNode, useEffect, useRef, useState } from "react";
import { useLang } from "../lang/lang-context";
import { useLocations } from "../locations/locations-context";
import { useColor } from "../theme/use-color";
import { LoanCustomerKyc } from "./components/loan-customer-kyc";
import { LoanDisburesement } from "./components/loan-disbursement";
import { LoanDocuments } from "./components/loan-documents";
import { LoanPayments } from "./components/loan-payments";
import { loanAssetTypes, loanStatuses } from "./loans-constants";
import { useUploadFile } from "../files/hooks/use-upload-file";

export const LoanDetail: NextPage = () => {
  const params = useParams();
  const code = params.code as string;
  const router = useRouter();
  const workspace = useWorkspace();
  const loans = useLoans();
  const layout = useLayout();
  const color = useColor();
  const { getGoogleMapLink } = useLocations();
  const uploadFile = useUploadFile();

  const isAutoRedirectStep = useRef(true);
  const [customerKyc, setCustomerKyc] = useState<CustomerKycEntity>();
  const [_pointedStep, setPointedStep] = useState(0);
  const pointedStep = _pointedStep > 3 ? 3 : _pointedStep;

  const fetchCustomerKyc = async (customerId: string) => {
    const kyc = await getCustomerKyc(customerId).catch(() => undefined);
    setCustomerKyc(kyc);
    return kyc;
  };

  const loan = useFetch({
    fetch: async () => {
      const loan = await getLoanByCode(code);
      const kyc = await fetchCustomerKyc(loan.customerId);
      if (isAutoRedirectStep.current) {
        const step = getStepActive(loan, kyc);
        setPointedStep(step);
      }

      return loan;
    },
    refetchEvents: {
      types: [
        EventType.LOANS_JUST_CREATED,
        EventType.LOANS_PENDING,
        EventType.LOANS_APPROVED,
        EventType.LOANS_REJECTED,
        EventType.LOANS_UPDATED,
        EventType.LOANS_FULFILLED,
        EventType.LOANS_COMPLETED,
        EventType.LOANS_ARCHIVED,
        EventType.LOANS_LIQUIDATION,
        EventType.LOANS_REVERT_LIQUIDATION,
        EventType.LOANS_SYNCED,
        EventType.LOANS_CHANGE_WORKSPACE_BRANCH,
        EventType.LOANS_APPROVED_REVERTED,
        EventType.LOANS_FULFILLED_REVERTED,
      ],
      condition: (e, _loan) => {
        return e.ref === _loan.id || (e.relatedEntities || []).some((v) => v.id === _loan.id);
      },
    },
  });

  const customer = useFetch({
    skip: !loan.data,
    id: `customer-${loan.data?.customerId}`,
    fetch: () => getCustomer(loan.data!.customerId),
    refetchEvents: [EventType.CUSTOMER_UPDATED],
  });

  const handleUpdateAssetData = useDebouncedCallback((assetData) => {
    onActionLoad({
      name: <Trans>Update asset information</Trans>,
      process: () => updateLoanAssetData(loan.data!.id, { assetData }, uploadFile).catch(onError),
    });
  }, 500);

  const onUpdateAssetData = (data: any) => {
    if (!loan.data) return;
    loan.setData({ ...loan.data!, assetData: data });
    handleUpdateAssetData(data);
  };

  useEffect(() => {
    if (loan.data)
      layout.setComponents({
        head: renderEntityCode(loan.data.code),
      });
  }, [loan.data]);

  useEventsListener(
    [
      EventType.CUSTOMER_KYC_APPROVED,
      EventType.CUSTOMER_KYC_REJECTED,
      EventType.CUSTOMER_KYC_PENDING,
    ],
    () => {
      if (loan.data) fetchCustomerKyc(loan.data.customerId);
    },
    [loan.data]
  );

  if (loan.error)
    return (
      <Stack p={16}>
        <Errored error={loan.error} centered />
      </Stack>
    );

  if (loan.isFetching || !customerKyc || !loans.isInitialized || customer.isFetching)
    return (
      <Stack p={16}>
        <Skeleton height={250} />
      </Stack>
    );

  if (!loan.data || !customer.data)
    return (
      <Stack p={16}>
        <Errored error={loan.error} centered />
      </Stack>
    );

  const activeStep = getStepActive(loan.data, customerKyc);

  const linkContractPdf =
    loan.data.status !== LoanStatus.PENDING_SIGN &&
    !!workspace.settings.loanSettings?.contractPdfUrl
      ? workspace.settings.loanSettings?.contractPdfUrl?.replace("{code}", loan.data.code)
      : undefined;

  const linkLiquidationPdf =
    loan.data?.isLiquidated && workspace.settings.loanSettings?.contractLiquidationPdfUrl
      ? workspace.settings.loanSettings?.contractLiquidationPdfUrl?.replace(
          "{code}",
          loan.data.code
        )
      : undefined;

  return (
    <Stack p={16}>
      <Card shadow="xs">
        <Group align="start">
          <EntityImage src={customer.data.avatar} readonly size={80} radius={10} />
          <Stack gap={10} flex={1}>
            <Group justify="space-between" w="100%" align="start">
              <Title fz={18} fw={600}>
                {customer.data.name}
              </Title>

              <Group gap={10}>
                {customer.data.phone &&
                  workspace.hasPermission(WorkspacePermission.CUSTOMERS_VIEW_CONTACT) && (
                    <Anchor
                      href={`tel:${customer.data.phone}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ActionIcon size="lg" radius={100}>
                        <IconPhone size={18} />
                      </ActionIcon>
                    </Anchor>
                  )}

                {(customer.data.location || customer.data.secondaryLocation) && (
                  <Anchor
                    onClick={(e) => e.stopPropagation()}
                    href={getGoogleMapLink(
                      customer.data.location! || customer.data.secondaryLocation!
                    )}
                    target="_blank"
                  >
                    <ActionIcon size="lg" radius={100} variant="outline">
                      <IconLocation size={18} />
                    </ActionIcon>
                  </Anchor>
                )}

                {workspace.hasPermission(WorkspacePermission.CUSTOMERS_UPDATE_INFO) && (
                  <Anchor
                    onClick={(e) => {
                      e.stopPropagation();
                      OnCustomerModal({
                        customer: customer.data,
                        onDone: async () => {},
                      });
                    }}
                  >
                    <ActionIcon size="lg" radius={100} variant="outline" color="gray.6">
                      <IconEdit size={18} strokeWidth={1.5} />
                    </ActionIcon>
                  </Anchor>
                )}
              </Group>
            </Group>

            <SimpleGrid cols={{ md: 4 }}>
              <InfoCard
                label={t`Birhtday`}
                visible={!!customer.data?.birthday}
                content={
                  <Text truncate="end" fz={16} fw={500} maw={250}>
                    {customer.data.birthday ? (
                      <DateFormat value={customer.data.birthday} type="date" />
                    ) : (
                      "--"
                    )}
                  </Text>
                }
              />

              <InfoCard
                label={t`Gender`}
                visible={!!customer.data?.gender}
                content={
                  <Text truncate="end" fz={16} fw={500} maw={250}>
                    {customer.data.gender ? genders[customer.data.gender].name() : "--"}
                  </Text>
                }
              />

              <InfoCard
                label={t`Phone`}
                content={
                  <Text truncate="end" fz={16} fw={500} maw={250}>
                    {customer.data.phone ? formatPhoneNumber(customer.data.phone) : "--"}
                  </Text>
                }
                href={`tel:${customer.data.phone}`}
                visible={workspace.hasPermission(WorkspacePermission.CUSTOMERS_VIEW_CONTACT)}
              />

              <InfoCard
                label={t`Email`}
                href={`mailto:${customer.data.email}`}
                visible={!!customer.data?.email}
                content={
                  <Text truncate="end" fz={16} fw={500} maw={250}>
                    {customer.data.email}
                  </Text>
                }
              />

              <InfoCard
                label={t`Loan package`}
                content={
                  <Text truncate="end" fz={16} fw={500} maw={250}>
                    {loan.data.package.id} / {loanAssetTypes[loan.data.assetType]?.label()}
                  </Text>
                }
              />

              <InfoCard
                label={t`Money amount`}
                content={
                  <Text truncate="end" fz={16} fw={500} maw={250}>
                    <CurrencyFormat value={loan.data.amount} />
                  </Text>
                }
              />

              {workspace.isShouldEnableBranches && (
                <InfoCard
                  label={t`Workspace branch`}
                  content={
                    <Text truncate="end" fz={16} fw={500} maw={250}>
                      {loan.data.workspaceBranch?.name || t`Main office`}
                    </Text>
                  }
                />
              )}

              <InfoCard
                label={t`Loan contract`}
                content={
                  linkContractPdf ? (
                    <Group gap={4} align="center">
                      <IconFileTypePdf size={18} />
                      <Trans>View contract</Trans>
                    </Group>
                  ) : (
                    <Text fz={16} fw={500}>
                      --
                    </Text>
                  )
                }
                href={linkContractPdf}
              />

              {linkLiquidationPdf && (
                <InfoCard
                  label={t`Liquidation statement`}
                  content={
                    linkLiquidationPdf ? (
                      <Group gap={4} align="center">
                        <IconFileTypePdf size={18} />
                        <Trans>View</Trans>
                      </Group>
                    ) : (
                      <Text fz={16} fw={500}>
                        --
                      </Text>
                    )
                  }
                  href={linkLiquidationPdf}
                />
              )}

              <InfoCard
                label={t`Status`}
                content={
                  <Text
                    truncate="end"
                    fz={16}
                    fw={500}
                    maw={250}
                    c={loanStatuses[loan.data.status].color}
                  >
                    {loanStatuses[loan.data.status].label()}
                  </Text>
                }
              />
            </SimpleGrid>
          </Stack>
        </Group>
      </Card>

      {(function () {
        if (loan.data.status === LoanStatus.PENDING_SIGN) {
          return (
            <Stack>
              <Card shadow="xs" p={30}>
                <Stack>
                  <Text c="orange" ta="center">
                    <Trans>Waiting for customer to sign the contract</Trans>
                  </Text>
                  <Renderer visible={workspace.hasPermission(WorkspacePermission.LOANS_CREATOR)}>
                    <Center>
                      <Button color="orange" onClick={() => OnModalSignLoan({ loan: loan.data! })}>
                        <Trans>Sign contract</Trans>
                      </Button>
                    </Center>
                  </Renderer>
                </Stack>
              </Card>
            </Stack>
          );
        }

        return (
          <Stack className="LoanDetail">
            <Stepper
              active={activeStep}
              size="xs"
              onStepClick={(s) => {
                if (s <= activeStep) {
                  setPointedStep(s);
                  isAutoRedirectStep.current = false;
                }
              }}
            >
              <Stepper.Step
                label={<Trans>Customer information & KYC</Trans>}
                icon={<IconUserScan size={18} />}
                completedIcon={<IconShieldCheckered size={18} />}
                allowStepSelect={activeStep >= 0}
                loading={activeStep === 0 && customerKyc?.status === CustomerKycStatus.PENDING}
                styles={{
                  stepIcon: {
                    borderColor: activeStep >= 1 ? color("primary") : undefined,
                    color: customerKyc?.status === CustomerKycStatus.REJECTED ? "red" : undefined,
                  },
                }}
                color={customerKyc?.status === CustomerKycStatus.REJECTED ? "red" : undefined}
              />

              <Stepper.Step
                label={<Trans>Loan application</Trans>}
                icon={<IconClipboardText size={18} />}
                completedIcon={<IconClipboardCheck size={18} />}
                disabled={activeStep < 1}
                allowStepSelect={activeStep >= 1}
                loading={activeStep === 1 && loan.data.status === LoanStatus.PENDING}
                styles={{
                  stepIcon: {
                    borderColor: activeStep >= 2 ? color("primary") : undefined,
                    color: loan.data.status === LoanStatus.REJECTED ? "red" : undefined,
                  },
                }}
                color={loan.data.status === LoanStatus.REJECTED ? "red" : undefined}
              />

              <Stepper.Step
                label={<Trans>Disbursement</Trans>}
                icon={<IconCreditCardPay size={18} />}
                completedIcon={<IconCreditCardPay size={18} />}
                disabled={activeStep < 2}
                allowStepSelect={activeStep >= 2}
                loading={activeStep === 2}
                styles={{
                  stepIcon: {
                    borderColor: activeStep >= 3 ? color("primary") : undefined,
                  },
                }}
              />

              <Stepper.Step
                label={<Trans>Payment</Trans>}
                icon={<IconAnalyze size={18} />}
                completedIcon={<IconAnalyze size={18} />}
                disabled={activeStep < 3}
                allowStepSelect={activeStep >= 3}
                loading={activeStep === 3}
                styles={{
                  stepIcon: {
                    borderColor: activeStep >= 4 ? color("primary") : undefined,
                  },
                }}
              />
            </Stepper>
            {
              [
                <LoanCustomerKyc customer={customer.data} kyc={customerKyc} />,
                <Container size="md">
                  <LoanDocuments loan={loan.data} updateAssetData={onUpdateAssetData} />
                </Container>,
                <Container size="md">
                  <LoanDisburesement loan={loan.data} kyc={customerKyc} />
                </Container>,
                <LoanPayments loan={loan} />,
              ][pointedStep]
            }

            <Container>
              <EventList ref={loan.data.id} />
            </Container>

            <Renderer
              visible={
                [LoanStatus.PENDING_SIGN, LoanStatus.PENDING].includes(loan.data?.status) &&
                workspace.hasPermission(WorkspacePermission.LOANS_ARCHIVE)
              }
            >
              <Center>
                <Button
                  h={25}
                  variant="subtle"
                  color="gray"
                  leftSection={
                    <IconArchive strokeWidth={1.3} size={16} style={{ marginRight: -5 }} />
                  }
                  onClick={() =>
                    onArchive({
                      name: `${t`Loan contract`} ${renderEntityCode(loan.data!.code)}`,
                      process: async () => {
                        await archiveLoan(loan.data!.id);
                        router.back();
                      },
                    })
                  }
                >
                  <Text fz={12} fw={400}>
                    <Trans>Delete</Trans>
                  </Text>
                </Button>
              </Center>
            </Renderer>
          </Stack>
        );
      })()}
    </Stack>
  );
};

const getStepActive = (loan: LoanEntity, kyc?: CustomerKycEntity): number => {
  if (!kyc || kyc.status !== CustomerKycStatus.APPROVED) return 0;
  if (loan.status === LoanStatus.PENDING) return 1;
  if (loan.status === LoanStatus.REJECTED) return 1;
  if (loan.status === LoanStatus.APPROVED) return 2;
  if (loan.status === LoanStatus.FULFILLED) return 3;
  return 4;
};

const InfoCard: FC<{
  label: string;
  content?: JSX.Element;
  href?: string;
  visible?: boolean;
}> = (props) => {
  if (!props.content || props.visible === false) return null;

  const ContentWrapper: FC<{ children: ReactNode }> = ({ children }) => {
    if (props.href)
      return (
        <Anchor href={props.href} target="_blank" component={Link}>
          {children}
        </Anchor>
      );
    return children;
  };

  return (
    <Stack gap={0}>
      <Text fz={12} fw={500} c="gray.6">
        {props.label}
      </Text>
      <ContentWrapper>{props.content}</ContentWrapper>
    </Stack>
  );
};
