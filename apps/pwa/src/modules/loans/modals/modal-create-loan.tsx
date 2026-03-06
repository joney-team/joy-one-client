"use client";

import { Button } from "@/components/buttons/button";
import { Empty } from "@/components/empty";
import { ModalHead } from "@/components/modal/modal-head";
import { Renderer } from "@/components/renderer";
import { useFormSubmit } from "@/hooks/use-form";
import { useRouter } from "@/hooks/use-router";
import { getCustomerKyc } from "@/modules/customer-kycs/customer-kycs-service";
import { CustomerKycEntity } from "@/modules/customer-kycs/customer-kycs-types";
import { WithModalRegisterCustomerKyc } from "@/modules/customer-kycs/modal-register-customer-kyc";
import { CustomerCard } from "@/modules/customers/components/customer-card";
import { CustomerInput } from "@/modules/customers/components/customer-input";
import { CustomerKycCard } from "@/modules/customers/components/customer-kyc-card";
import { CustomerDataFragment } from "@/modules/customers/graphql/fragmentCustomer.graphql";
import { useUploadFile } from "@/modules/files/hooks/use-upload-file";
import { LoanAssetDataInput } from "@/modules/loans/components/loan-asset-data-inputs";
import { CreateLoanDto } from "@/modules/loans/loan-dtos";
import { createLoan, getLoans, renderLoanPeriod } from "@/modules/loans/loans-service";
import { LoanAssetType } from "@/modules/loans/loans-types";
import { getGeolocation } from "@/modules/locations/locations-service";
import { useBanks } from "@/modules/plugins/banks/banks.services";
import { WorkspaceBranchInput } from "@/modules/workspace-branches/workspace-branch-input";
import { useWorkspaceSetting } from "@/modules/workspace-settings/hooks/use-workspace-setting";
import { renderBankSelectOption } from "@/modules/workspaces/components/workspace-bank-information";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onError } from "@/utils/exceptions.utils";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  Card,
  Group,
  InputWrapper,
  Modal,
  NumberInput,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  Icon,
  IconArrowsExchange,
  IconBuildingSkyscraper,
  IconCheck,
  IconCreditCardPay,
  IconFileDots,
  IconPlus,
  IconUser,
  IconUserScan,
} from "@tabler/icons-react";
import {
  FC,
  forwardRef,
  Fragment,
  PropsWithChildren,
  ReactNode,
  useImperativeHandle,
  useState,
} from "react";
import { loanAssetTypes } from "../loans-constants";

interface ModalCreateLoanProps {
  customer?: CustomerDataFragment;
}

export interface ModalCreateLoanRef {
  open: (props?: ModalCreateLoanProps) => void;
  close: () => void;
}

export const ModalCreateLoan = forwardRef<
  ModalCreateLoanRef,
  { children?: (ref: ModalCreateLoanRef) => ReactNode }
>((props, ref) => {
  const { t } = useLingui();
  const { workspaceSetting } = useWorkspaceSetting();
  const { children } = props;
  const [args, setArgs] = useState<ModalCreateLoanProps | null>(null);

  const onClose = () => setArgs(null);

  const onOpen = (p?: ModalCreateLoanProps) => {
    setArgs(p ?? {});
    setIsInitialized(false);
    setCustomer(p?.customer);
    form.reset();
    initialize(p)
      .then(() => setIsInitialized(true))
      .catch((error) => {
        onError(error);
        setArgs(null);
      });
  };

  useImperativeHandle(ref, () => ({
    open: (p) => {
      onOpen(p);
    },
    close: () => {
      onClose();
    },
  }));

  const banks = useBanks();
  const router = useRouter();
  const workspace = useWorkspace();
  const uploadFile = useUploadFile();

  const [isInitialized, setIsInitialized] = useState(false);
  const [isFetchingCustomerKyc, setIsFetchingCustomerKyc] = useState(false);

  const [customer, setCustomer] = useState<CustomerDataFragment>();
  const [customerKyc, setCustomerKyc] = useState<CustomerKycEntity>();

  const form = useForm({
    initialValues: {
      amount: 0,
      assetType: Object.values(LoanAssetType)[0],
      assetData: {},
      signature: "",
      payment_accountName: "",
      payment_accountNumber: "",
      payment_accountBankId: "",
      workspaceBranch: workspace.defaultBranch,
    } as any,
    validate: {
      amount: (value) => {
        if (!value) return "Vui lòng nhập số tiền vay";
        if (value < 1000000) return "Số tiền vay tối thiểu là 1,000,000 VND";
      },
      assetType: (value) => {
        if (!value) return "Vui lòng chọn loại tài sản";
      },
      assetData: (value) => {
        if (!value) return "Vui lòng nhập thông tin tài sản";
      },
      payment_accountName: (value) => {
        if (!value) return "Vui lòng nhập tên tài khoản";
      },
      payment_accountNumber: (value) => {
        if (!value) return "Vui lòng nhập số tài khoản";
      },
      payment_accountBankId: (value) => {
        if (!value) return "Vui lòng chọn ngân hàng";
      },
      packageDays: (value) => {
        if (!value) return "Vui lòng chọn thời hạn vay";
      },
    },
  });

  const initialize = async (p?: ModalCreateLoanProps) => {
    if (!p?.customer) return;

    setIsFetchingCustomerKyc(true);

    const [kyc, previousLoan] = await Promise.all([
      getCustomerKyc(p.customer._id).catch(() => undefined),
      getLoans({ customerId: p.customer._id, limit: 1 }).then((res) => res.data[0]),
    ]);

    setCustomerKyc(kyc);
    setCustomer(p.customer);
    form.setFieldValue("workspaceBranch", previousLoan?.workspaceBranch || workspace.defaultBranch);

    setIsFetchingCustomerKyc(false);
  };

  const loanPackages = workspaceSetting?.loanSettings?.loanPackages || [];

  const assetTypeOptions: LoanAssetType[] = loanPackages.reduce((output, p) => {
    return Array.from([...(new Set([...output, ...p.assetTypes]) as any)]);
  }, [] as LoanAssetType[]);

  const packageDaysOptions = loanPackages.reduce((output, p) => {
    if (form.values.assetType && p.assetTypes.includes(form.values.assetType)) {
      output = Array.from([...(new Set([...output, p.days]) as any)]);
    }

    return output;
  }, [] as number[]);

  const packagePeriodDaysOptions = loanPackages.reduce((output, p) => {
    if (
      form.values.assetType &&
      p.assetTypes.includes(form.values.assetType) &&
      form.values.packageDays &&
      p.days === form.values.packageDays
    ) {
      return p.periodDaysOptions;
    }
    return output;
  }, [] as number[]);

  const submit = useFormSubmit(form, {
    onSubmit: async (values) => {
      if (!customer) return;
      const location = await getGeolocation();
      const loanPackage = loanPackages.find(
        (p) => p.assetTypes.includes(values.assetType) && p.days === values.packageDays
      );
      if (!loanPackage) return;

      let dto: CreateLoanDto = {
        workspaceBranchId: values.workspaceBranch?._id,
        customerId: customer._id,
        amount: values.amount,
        assetType: values.assetType,
        packageId: loanPackage.id,
        packagePeriodDays: values.packagePeriodDays,
        assetData: values.assetData,
        payment: {
          accountName: values.payment_accountName,
          accountNumber: values.payment_accountNumber,
          accountBankId: values.payment_accountBankId,
        },
        coord: {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        },
      };

      // Submit
      const loan = await createLoan(dto, uploadFile);
      await router.push(`/loans/${loan.code}`);
      onClose();
    },
    onError,
  });

  return (
    <Fragment>
      {typeof children === "function"
        ? children({
            open: (p) => {
              onOpen(p);
            },
            close: () => {
              onClose();
            },
          })
        : null}

      <Modal
        title={<ModalHead name={t`Create loan`} icon={IconCreditCardPay} />}
        onClose={onClose}
        opened={!!args}
        size={1000}
        closeOnEscape={false}
      >
        <Stack gap={16}>
          {(function () {
            if (!isInitialized) return <Skeleton height={150} />;

            return (
              <Fragment>
                <Session name={t`Customer`} icon={IconUser}>
                  <CustomerInput
                    value={customer}
                    onSelect={(c) => initialize({ customer: c as any })}
                    renderValue={(ctx) => {
                      if (ctx.value)
                        return (
                          <Stack gap={8} w="100%">
                            <CustomerCard
                              customer={ctx.value as any}
                              withBorder={false}
                              shadow="xs"
                              p={10}
                              w="100%"
                              flex={1}
                              style={{ overflow: "visible" }}
                              disableClick
                            />

                            <Group>
                              <Button
                                size="compact-sm"
                                color="gray.5"
                                leftIcon={IconArrowsExchange}
                                variant="outline"
                                onClick={ctx.toggle}
                              >
                                <Trans>Change customer</Trans>
                              </Button>
                            </Group>
                          </Stack>
                        );

                      return (
                        <Button leftIcon={IconPlus} variant="outline" onClick={ctx.toggle}>
                          <Trans>Add customer information</Trans>
                        </Button>
                      );
                    }}
                  />
                </Session>

                <Session name="KYC" icon={IconUserScan}>
                  {(function () {
                    if (!customer)
                      return <Empty hideBorder message={t`Need customer information`} />;
                    if (isFetchingCustomerKyc) return <Skeleton height={50} />;
                    if (customerKyc)
                      return (
                        <CustomerKycCard
                          kyc={customerKyc}
                          hideCustomer
                          cardProps={{ p: 16, withBorder: false, shadow: "xs" }}
                          onApproved={(kyc) => setCustomerKyc(kyc)}
                        />
                      );

                    return (
                      <Group>
                        <WithModalRegisterCustomerKyc>
                          {(openModal) => (
                            <Button
                              leftIcon={IconPlus}
                              variant="outline"
                              onClick={() =>
                                openModal({
                                  customer,
                                  onDone: async () => initialize({ customer }),
                                })
                              }
                            >
                              <Trans>Add KYC</Trans>
                            </Button>
                          )}
                        </WithModalRegisterCustomerKyc>
                      </Group>
                    );
                  })()}
                </Session>

                <Session name={t`Loan information`} icon={IconCreditCardPay}>
                  {(function () {
                    if (!customer || !customerKyc)
                      return <Empty hideBorder message={t`Need customer information and KYC`} />;
                    return (
                      <Card withBorder p={16} shadow="xs">
                        <Stack>
                          <SimpleGrid cols={{ md: 3 }}>
                            <Select
                              label={t`Asset type`}
                              data={assetTypeOptions.map((type) => ({
                                value: type,
                                label: t(loanAssetTypes[type].label),
                              }))}
                              {...form.getInputProps("assetType")}
                            />

                            <Select
                              label={t`Loan period`}
                              data={packageDaysOptions.map((d) => ({
                                value: d.toString(),
                                label: renderLoanPeriod(d),
                              }))}
                              {...form.getInputProps("packageDays")}
                              value={form.values.packageDays?.toString()}
                              onChange={(value) => form.setFieldValue("packageDays", +value!)}
                            />

                            <Select
                              label={t`Loan payment periods`}
                              data={packagePeriodDaysOptions.map((d) => ({
                                value: d.toString(),
                                label: renderLoanPeriod(d),
                              }))}
                              {...form.getInputProps("packagePeriodDays")}
                              value={form.values.packagePeriodDays?.toString()}
                              onChange={(value) => form.setFieldValue("packagePeriodDays", +value!)}
                            />
                          </SimpleGrid>

                          <NumberInput
                            label={t`Loan amount`}
                            hideControls
                            {...form.getInputProps("amount")}
                          />

                          <InputWrapper label={t`Loan payment account`}>
                            <SimpleGrid cols={{ md: 3 }}>
                              <Select
                                placeholder={t`Select bank`}
                                searchable
                                data={banks.map((v) => ({
                                  value: v.id.toString(),
                                  label: `${v.shortName}`,
                                  name: v.name,
                                  logo: v.logo,
                                }))}
                                {...form.getInputProps("payment_accountBankId")}
                                value={form.values.payment_accountBankId?.toString()}
                                onChange={(value) =>
                                  form.setFieldValue("payment_accountBankId", +value!)
                                }
                                renderOption={renderBankSelectOption}
                              />

                              <TextInput
                                placeholder={t`Bank account number`}
                                {...form.getInputProps("payment_accountNumber")}
                              />

                              <TextInput
                                placeholder={t`Bank account name`}
                                {...form.getInputProps("payment_accountName")}
                              />
                            </SimpleGrid>
                          </InputWrapper>
                        </Stack>
                      </Card>
                    );
                  })()}
                </Session>

                {form.values.assetType && !!customerKyc && (
                  <Session name={t`Loan asset data`} icon={IconFileDots}>
                    <Card withBorder p={16} shadow="xs">
                      <LoanAssetDataInput
                        assetType={form.values.assetType}
                        value={form.values.assetData}
                        onChange={(value) => form.setFieldValue("assetData", value)}
                      />
                    </Card>
                  </Session>
                )}

                <Renderer visible={workspace.isShouldEnableBranches}>
                  <Session name={t`Branch`} icon={IconBuildingSkyscraper}>
                    <WorkspaceBranchInput
                      value={form.values.workspaceBranch}
                      onChange={(branch) => form.setFieldValue("workspaceBranch", branch)}
                    />
                  </Session>
                </Renderer>

                <Group mt={10} justify="center">
                  <Button
                    onClick={() => submit.handle()}
                    type="submit"
                    miw={300}
                    maw="100%"
                    leftIcon={IconCheck}
                  >
                    <Trans>Submit loan</Trans>
                  </Button>
                </Group>
              </Fragment>
            );
          })()}
        </Stack>
      </Modal>
    </Fragment>
  );
});

const Session: FC<PropsWithChildren<{ name: string; icon: Icon; isWithoutCard?: boolean }>> = (
  props
) => {
  return (
    <Stack gap={5}>
      <Group gap={3}>
        <ThemeIcon variant="transparent" radius={100}>
          <props.icon size={20} />
        </ThemeIcon>
        <Text fw={500}>{props.name}</Text>
      </Group>

      {!props.isWithoutCard ? (
        <Card withBorder={false} shadow="none" p={10} style={{ overflow: "visible" }} bg="gray.1">
          {props.children}
        </Card>
      ) : (
        props.children
      )}
    </Stack>
  );
};
