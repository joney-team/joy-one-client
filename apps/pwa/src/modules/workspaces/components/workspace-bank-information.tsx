"use client";

import { getBanks } from "@/modules/plugins/banks/banks.services";
import { BankInformation } from "@/modules/plugins/banks/banks.types";
import { useWorkspaceSetting } from "@/modules/workspace-settings/hooks/useWorkspaceSetting";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onFormErrorLegacy } from "@/utils/exceptions.utils";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  Badge,
  Box,
  Card,
  em,
  Group,
  Select,
  SelectProps,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCheck, IconInfoCircle, IconLockCheck } from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";
import { Button } from "../../../components/buttons/button";
import { Image } from "../../../components/image";

export const WorkspaceBankInformation: FC = () => {
  const { t } = useLingui();
  const [banks, setBanks] = useState<BankInformation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const workspace = useWorkspace();
  const { updateWorkspaceSetting, workspaceSetting } = useWorkspaceSetting();

  const fetchBanks = async () => {
    return getBanks()
      .then((res) => setBanks(res.data))
      .catch(() => false);
  };

  const form = useForm({
    initialValues: workspaceSetting?.bankAccount ?? ({} as any),
    validate: {
      bankId: (value) => {
        if (!value) return t`Select bank`;
      },
      accountNumber: (value) => {
        if (!value) return t`Enter account number`;
      },
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await updateWorkspaceSetting({
        bankAccount: { ...values, bankId: +values.bankId },
      });
    } catch (error) {
      onFormErrorLegacy(form);
    }
    setIsSubmitting(false);
  });

  useEffect(() => {
    fetchBanks();
  }, []);

  useEffect(() => {
    form.setInitialValues(workspaceSetting?.bankAccount ?? ({} as any));
  }, [workspaceSetting?.bankAccount]);

  return (
    <Card shadow="xs" className="WorkspaceBankInformation">
      <Stack>
        <SimpleGrid cols={{ md: 2 }}>
          <Select
            label="Chọn ngân hàng"
            searchable
            data={banks.map((v) => ({
              value: v.id.toString(),
              label: `${v.shortName}`,
              name: v.name,
              logo: v.logo,
            }))}
            {...form.getInputProps("bankId")}
            value={form.values.bankId?.toString()}
            onChange={(value) => form.setFieldValue("bankId", +value!)}
            renderOption={renderBankSelectOption}
          />

          <TextInput label="Số tài khoản" {...form.getInputProps("accountNumber")} />
        </SimpleGrid>

        <Group justify="space-between">
          {(function () {
            if (!workspaceSetting?.bankAccount)
              return (
                <Group gap={4}>
                  <ThemeIcon color="gray" variant="transparent">
                    <IconInfoCircle strokeWidth={1.5} />
                  </ThemeIcon>
                  <Text c="gray" fz={12}>
                    Cần cập nhật thông tin ngân hàng nhận thanh toán
                  </Text>
                </Group>
              );

            if (!workspaceSetting?.bankAccount?.accountName) return <Box />;

            return (
              <Group gap={8}>
                <ThemeIcon color="green" variant="light" size="xl">
                  <IconLockCheck strokeWidth={1.5} size={25} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Group gap={8}>
                    <Text>Tài khoản</Text>
                    <Badge color="green" size="xs">
                      Đã xác thực
                    </Badge>
                  </Group>
                  <Text>
                    <strong>{workspaceSetting?.bankAccount?.accountName}</strong>
                  </Text>
                </Stack>
              </Group>
            );
          })()}

          <Button
            type="submit"
            loading={isSubmitting}
            onClick={() => onSubmit()}
            disabled={!form.isDirty()}
          >
            <Trans>Update</Trans>
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};

export const renderBankSelectOption: SelectProps["renderOption"] = ({ option, checked }) => (
  <Group flex={1} gap="xs" wrap="nowrap" justify="space-between">
    <Text fz={em(13)}>
      <strong>{option.label}</strong> {(option as any).name}
    </Text>
    <Group align="center" wrap="nowrap" justify="end">
      <Group style={{ width: 70 }}>
        <Image w="100%" src={(option as any).logo} />
      </Group>

      {checked && <IconCheck style={{ marginInlineStart: "auto" }} strokeWidth={1.5} size={18} />}
    </Group>
  </Group>
);
