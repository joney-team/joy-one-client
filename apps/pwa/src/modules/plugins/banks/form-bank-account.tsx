"use client";

import { useRestQuery } from "@/modules/apis/use-rest-query";
import { BankAccount, BankInformation } from "@/modules/plugins/banks/banks.types";
import { ResponseList } from "@/types";
import { em, Group, Select, SelectProps, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { FC } from "react";
import { Image } from "../../../components/image";

interface FormBankAccountProps {
  bankAccount?: Partial<BankAccount>;
  onChange: (bankAccount?: Partial<BankAccount>) => any;
}

export const FormBankAccount: FC<FormBankAccountProps> = ({ bankAccount, onChange }) => {
  const banks = useRestQuery<ResponseList<BankInformation>>({
    route: "/plugins/banks",
  });

  const handleChange = (key: keyof BankAccount, value: any) => {
    onChange({ ...(bankAccount || {}), [key]: value } as any);
  };

  return (
    <Stack>
      <SimpleGrid>
        <Select
          label="Chọn ngân hàng"
          searchable
          data={banks.data?.data.map((v) => ({
            value: v.id.toString(),
            label: `${v.shortName}`,
            name: v.name,
            logo: v.logo,
          }))}
          value={bankAccount?.bankId?.toString()}
          onChange={(value) => handleChange("bankId", +value!)}
          renderOption={renderBankSelectOption}
        />

        <TextInput
          label="Số tài khoản"
          value={bankAccount?.accountNumber}
          onChange={(e) => handleChange("accountNumber", e.target.value)}
        />
      </SimpleGrid>
    </Stack>
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
