"use client";

import { Button } from "@/components/buttons/button";
import { Container } from "@/components/container";
import { EntityImage } from "@/components/entity-image";
import { Errored } from "@/components/errored";
import { CurrencyFormat } from "@/components/format/currency-format";
import { DateFormat } from "@/components/format/date-format";
import { Renderer } from "@/components/renderer";
import { SectionTitle } from "@/components/session-title";
import { genders } from "@/constant";
import { CustomerKycStatus, EventType, LoanStatus } from "@/graphql/enums.graphql";
import { useRouter } from "@/hooks/use-router";
import { useLayout } from "@/layout/layout-context";
import { useEventsListener } from "@/modules/events/event-service";
import { prepareLoanAssetData } from "@/modules/loans/loans-service";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { renderEntityCode } from "@/modules/workspaces/utils";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { AppEntity } from "@/types";
import { onActionLoad, onArchive } from "@/utils/actions";
import { onError } from "@/utils/exceptions.utils";
import { nonLoading } from "@/utils/non-loading";
import { formatPhoneNumber } from "@/utils/phone.utils";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  ActionIcon,
  Anchor,
  Card,
  Center,
  Group,
  noop,
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
  IconTimelineEvent,
  IconUserScan,
} from "@tabler/icons-react";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FC, ReactNode, useEffect, useRef, useState } from "react";
import { useUploadFile } from "../files/hooks/use-upload-file";
import { useLocations } from "../locations/locations-context";
import { useColor } from "../theme/use-color";
import { useWorkspaceSetting } from "../workspace-settings/hooks/use-workspace-setting";
import { loanAssetTypes, loanStatuses } from "./loans-constants";

import { useCustomer } from "../customers/hooks/useCustomer";

import { useMutation, useQuery } from "@apollo/client/react";
import { CustomerKycFragment } from "../customer-kycs/graphql/fragmentCustomerKyc.graphql";
import { useCustomerKyc } from "../customer-kycs/hooks/use-customer-kyc";
import { LoanFragment } from "./graphql/fragmentLoan.graphql";
import QUERY_LOAN_BY_CODE from "./graphql/queryLoanByCode.graphql";

import MUTATION_ARCHIVE_LOAN from "./graphql/mutationArchiveLoan.graphql";
import MUTATION_UPDATE_LOAN_ASSET_DATA from "./graphql/mutationUpdateLoanAssetData.graphql";

const RelatedLoans = dynamic(
  () => import("./components/related-loans").then((mod) => mod.RelatedLoans),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const ModalCustomer = dynamic(
  () => import("../customers/customer-modal").then((mod) => mod.ModalCustomer),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const LoanCustomerKyc = dynamic(
  () => import("./components/loan-customer-kyc").then((mod) => mod.LoanCustomerKyc),
  {
    ssr: false,
    loading: () => <Skeleton height={300} />,
  },
);

const LoanDisburesement = dynamic(
  () => import("./components/loan-disbursement").then((mod) => mod.LoanDisburesement),
  {
    ssr: false,
    loading: () => <Skeleton height={300} />,
  },
);

const LoanPayments = dynamic(
  () => import("./components/loan-payments").then((mod) => mod.LoanPayments),
  {
    ssr: false,
    loading: () => <Skeleton height={300} />,
  },
);

const LoanDocuments = dynamic(
  () => import("./components/loan-documents").then((mod) => mod.LoanDocuments),
  {
    ssr: false,
    loading: () => <Skeleton height={300} />,
  },
);

const ModalSignLoan = dynamic(
  () => import("./modals/modal-sign-loan").then((mod) => mod.ModalSignLoan),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const EventList = dynamic(
  () => import("@/modules/events/events-list").then((mod) => mod.EventsList),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const Activities = dynamic(
  () => import("@/modules/activities/activities").then((mod) => mod.Activities),
  {
    ssr: false,
    loading: nonLoading,
  },
);

export const LoanDetail: NextPage = () => {
  const { t } = useLingui();
  const params = useParams<{ code: string }>();
  const { code } = params;
  const router = useRouter();
  const workspace = useWorkspace();
  const layout = useLayout();
  const color = useColor();
  const { getGoogleMapLink } = useLocations();
  const uploadFile = useUploadFile();
  const { workspaceSetting } = useWorkspaceSetting();

  const isAutoRedirectStep = useRef(true);
  const [_pointedStep, setPointedStep] = useState(0);
  const pointedStep = _pointedStep > 3 ? 3 : _pointedStep;

  const {
    data: loanData,
    loading: loanLoading,
    error: loanError,
    refetch: refetchLoan,
  } = useQuery(QUERY_LOAN_BY_CODE, {
    variables: { code },
    fetchPolicy: "cache-and-network",
  });

  const loan = loanData?.loanByCode;

  useEventsListener(
    [
      EventType.LoansJustCreated,
      EventType.LoansPending,
      EventType.LoansApproved,
      EventType.LoansRejected,
      EventType.LoansUpdated,
      EventType.LoansFulfilled,
      EventType.LoansCompleted,
      EventType.LoansArchived,
      EventType.LoansLiquidation,
      EventType.LoansRevertLiquidation,
      EventType.LoansSynced,
      EventType.LoansChangeWorkspaceBranch,
      EventType.LoansApprovedReverted,
      EventType.LoansFulfilledReverted,
    ],
    (e) => {
      if (e.ref === loanData?.loanByCode?.id) {
        refetchLoan();
      }
    },
    [loanData?.loanByCode?.id],
  );

  const {
    customerKyc,
    loading: customerKycLoading,
    error: customerKycError,
  } = useCustomerKyc(loanData?.loanByCode?.customerId);

  useEffect(() => {
    if (loanData?.loanByCode && customerKyc && isAutoRedirectStep.current) {
      const step = getStepActive(loanData.loanByCode, customerKyc);
      setPointedStep(step);
    }
  }, [loanData?.loanByCode, customerKyc]);

  const {
    customer,
    loading: customerLoading,
    error: customerError,
  } = useCustomer(loanData?.loanByCode?.customerId);

  const [updateLoanAssetData] = useMutation(MUTATION_UPDATE_LOAN_ASSET_DATA);
  const [archiveLoan] = useMutation(MUTATION_ARCHIVE_LOAN);

  const handleUpdateAssetData = useDebouncedCallback((assetData) => {
    if (!loanData?.loanByCode?.id) return;
    onActionLoad({
      name: <Trans>Update asset information</Trans>,
      process: async () => {
        const assetDataUploaded = await prepareLoanAssetData(assetData, uploadFile);
        await updateLoanAssetData({
          variables: {
            updateLoanAssetDataId: loanData?.loanByCode?.id,
            input: { assetData: assetDataUploaded },
          },
        }).catch(onError);
      },
    });
  }, 500);

  const onUpdateAssetData = (data: any) => {
    if (!loan) return;
    handleUpdateAssetData(data);
  };

  useEffect(() => {
    if (loan)
      layout.setComponents({
        head: renderEntityCode(loan.code),
      });
  }, [loan]);

  if (loanError)
    return (
      <Stack p={16}>
        <Errored error={loanError} centered />
      </Stack>
    );

  if (
    (loanLoading && !loanData) ||
    (customerKycLoading && !customerKyc) ||
    (customerLoading && !customer)
  )
    return (
      <Stack p={16}>
        <Skeleton height={250} />
      </Stack>
    );

  if (!loan || !customer || customerError || customerKycError)
    return (
      <Stack p={16}>
        <Errored error={loanError ?? customerError ?? customerKycError} centered />
      </Stack>
    );

  const activeStep = getStepActive(loan, customerKyc);

  const linkContractPdf =
    loan.status !== LoanStatus.PendingSign && !!workspaceSetting?.loanSettings?.contractPdfUrl
      ? workspaceSetting?.loanSettings?.contractPdfUrl?.replace("{code}", loan.code)
      : undefined;

  const linkLiquidationPdf =
    loan.isLiquidated && workspaceSetting?.loanSettings?.contractLiquidationPdfUrl
      ? workspaceSetting?.loanSettings?.contractLiquidationPdfUrl?.replace("{code}", loan.code)
      : undefined;

  if (!customerKyc)
    return (
      <Stack p="sm">
        <Errored error={new Error(t`Customer KYC not found`)} centered />
      </Stack>
    );

  return (
    <Stack p={0} pb="sm">
      <Stack p="sm">
        <Card shadow="xs">
          <Group align="start">
            <EntityImage src={customer.avatar} readonly size={80} radius={10} />
            <Stack gap={10} flex={1}>
              <Group justify="space-between" w="100%" align="start">
                <Title fz={18} fw={600}>
                  {customer.name}
                </Title>

                <Group gap={10}>
                  {customer.phone &&
                    workspace.hasPermission(WorkspacePermission.CUSTOMERS_VIEW_CONTACT) && (
                      <Anchor href={`tel:${customer.phone}`} onClick={(e) => e.stopPropagation()}>
                        <ActionIcon size="lg" radius={100}>
                          <IconPhone size={18} />
                        </ActionIcon>
                      </Anchor>
                    )}

                  {(customer.location || customer.secondaryLocation) && (
                    <Anchor
                      onClick={(e) => e.stopPropagation()}
                      href={getGoogleMapLink(customer.location ?? customer.secondaryLocation)}
                      target="_blank"
                    >
                      <ActionIcon size="lg" radius={100} variant="outline">
                        <IconLocation size={18} />
                      </ActionIcon>
                    </Anchor>
                  )}

                  {workspace.hasPermission(WorkspacePermission.CUSTOMERS_UPDATE_INFO) && (
                    <ModalCustomer>
                      {(modalCustomer) => (
                        <Anchor
                          onClick={(e) => {
                            e.stopPropagation();
                            modalCustomer.open({
                              customer: customer,
                              onDone: noop,
                            });
                          }}
                        >
                          <ActionIcon size="lg" radius={100} variant="outline" color="gray.6">
                            <IconEdit size={18} strokeWidth={1.5} />
                          </ActionIcon>
                        </Anchor>
                      )}
                    </ModalCustomer>
                  )}
                </Group>
              </Group>

              <SimpleGrid cols={{ md: 4 }}>
                <InfoCard
                  label={<Trans>Birhtday</Trans>}
                  visible={!!customer?.birthday}
                  content={
                    <Text truncate="end" fz={16} fw={500} maw={250}>
                      {customer.birthday ? (
                        <DateFormat value={customer.birthday} type="date" />
                      ) : (
                        "--"
                      )}
                    </Text>
                  }
                />

                <InfoCard
                  label={<Trans>Gender</Trans>}
                  visible={!!customer?.gender}
                  content={
                    <Text truncate="end" fz={16} fw={500} maw={250}>
                      {customer.gender ? genders[customer.gender].name() : "--"}
                    </Text>
                  }
                />

                <InfoCard
                  label={<Trans>Phone</Trans>}
                  content={
                    <Text truncate="end" fz={16} fw={500} maw={250}>
                      {customer.phone ? formatPhoneNumber(customer.phone) : "--"}
                    </Text>
                  }
                  href={`tel:${customer.phone}`}
                  visible={workspace.hasPermission(WorkspacePermission.CUSTOMERS_VIEW_CONTACT)}
                />

                <InfoCard
                  label={<Trans>Email</Trans>}
                  href={`mailto:${customer.email}`}
                  visible={!!customer?.email}
                  content={
                    <Text truncate="end" fz={16} fw={500} maw={250}>
                      {customer.email}
                    </Text>
                  }
                />

                <InfoCard
                  label={<Trans>Loan package</Trans>}
                  content={
                    <Text truncate="end" fz={16} fw={500} maw={250}>
                      {loan.package.id} / {t(loanAssetTypes[loan.assetType].label)}
                    </Text>
                  }
                />

                <InfoCard
                  label={<Trans>Money amount</Trans>}
                  content={
                    <Text truncate="end" fz={16} fw={500} maw={250}>
                      <CurrencyFormat value={loan.amount} />
                    </Text>
                  }
                />

                {workspace.isShouldEnableBranches && (
                  <InfoCard
                    label={<Trans>Workspace branch</Trans>}
                    content={
                      <Text truncate="end" fz={16} fw={500} maw={250}>
                        {loan.workspaceBranch?.name || <Trans>Main office</Trans>}
                      </Text>
                    }
                  />
                )}

                <InfoCard
                  label={<Trans>Loan contract</Trans>}
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
                    label={<Trans>Liquidation statement</Trans>}
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
                      c={loanStatuses[loan.status].color}
                    >
                      {t(loanStatuses[loan.status].label)}
                    </Text>
                  }
                />
              </SimpleGrid>
            </Stack>
          </Group>
        </Card>
      </Stack>

      {(function () {
        if (loan.status === LoanStatus.PendingSign) {
          return (
            <Stack>
              <Card shadow="xs" p={30}>
                <Stack>
                  <Text c="orange" ta="center">
                    <Trans>Waiting for customer to sign the contract</Trans>
                  </Text>
                  <Renderer visible={workspace.hasPermission(WorkspacePermission.LOANS_CREATOR)}>
                    <Center>
                      <ModalSignLoan>
                        {(open) => (
                          <Button color="orange" onClick={() => open({ loan })}>
                            <Trans>Sign contract</Trans>
                          </Button>
                        )}
                      </ModalSignLoan>
                    </Center>
                  </Renderer>
                </Stack>
              </Card>
            </Stack>
          );
        }

        return (
          <Stack className="LoanDetail">
            <Stack px="sm">
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
                  loading={activeStep === 0 && customerKyc?.status === CustomerKycStatus.Pending}
                  styles={{
                    stepIcon: {
                      borderColor: activeStep >= 1 ? color("primary") : undefined,
                      color: customerKyc?.status === CustomerKycStatus.Rejected ? "red" : undefined,
                    },
                  }}
                  color={customerKyc?.status === CustomerKycStatus.Rejected ? "red" : undefined}
                />

                <Stepper.Step
                  label={<Trans>Loan application</Trans>}
                  icon={<IconClipboardText size={18} />}
                  completedIcon={<IconClipboardCheck size={18} />}
                  disabled={activeStep < 1}
                  allowStepSelect={activeStep >= 1}
                  loading={activeStep === 1 && loan.status === LoanStatus.Pending}
                  styles={{
                    stepIcon: {
                      borderColor: activeStep >= 2 ? color("primary") : undefined,
                      color: loan.status === LoanStatus.Rejected ? "red" : undefined,
                    },
                  }}
                  color={loan.status === LoanStatus.Rejected ? "red" : undefined}
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
            </Stack>

            {
              [
                <Container size={900}>
                  <LoanCustomerKyc customer={customer} kyc={customerKyc} />
                  <RelatedLoans
                    customerCidNumber={
                      customerKyc.versions[customerKyc.versions.length - 1].cidNumber
                    }
                    ignoreCode={loan.code}
                  />
                </Container>,
                <Container size={900}>
                  <LoanDocuments loan={loan} updateAssetData={onUpdateAssetData}>
                    <RelatedLoans
                      customerCidNumber={
                        customerKyc.versions[customerKyc.versions.length - 1].cidNumber
                      }
                      ignoreCode={loan.code}
                    />
                  </LoanDocuments>
                </Container>,
                <Container size={900}>
                  <LoanDisburesement loan={loan} kyc={customerKyc} />
                </Container>,
                <Container fluid>
                  <LoanPayments loan={loan} refetch={refetchLoan} />
                </Container>,
              ][pointedStep]
            }

            <Container mt="xl" size={900}>
              <Stack gap="xs">
                <SectionTitle name={<Trans>Activities</Trans>} icon={IconTimelineEvent} />
                <Activities contextId={loan.id} contextType={AppEntity.LOANS} />
              </Stack>

              <EventList ref={loan.id} />
            </Container>

            <Renderer
              visible={
                ([LoanStatus.PendingSign, LoanStatus.Pending] as LoanStatus[]).includes(
                  loan?.status,
                ) && workspace.hasPermission(WorkspacePermission.LOANS_ARCHIVE)
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
                      name: `${t`Loan contract`} ${renderEntityCode(loan.code)}`,
                      process: async () => {
                        await archiveLoan({ variables: { archiveLoanId: loan.id } });
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

const getStepActive = (loan: LoanFragment, kyc?: CustomerKycFragment | null): number => {
  if (!kyc || kyc.status !== CustomerKycStatus.Approved) return 0;
  if (loan.status === LoanStatus.Pending) return 1;
  if (loan.status === LoanStatus.Rejected) return 1;
  if (loan.status === LoanStatus.Approved) return 2;
  if (loan.status === LoanStatus.Fulfilled) return 3;
  return 4;
};

const InfoCard: FC<{
  label: ReactNode;
  content?: ReactNode;
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
