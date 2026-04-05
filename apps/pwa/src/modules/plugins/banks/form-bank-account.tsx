"use client";

import { PluginBankAccountInput } from "@/graphql/types.graphql";
import { BankAccount } from "@/modules/plugins/banks/banks.types";
import { useQuery } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import { em, Group, Select, SelectProps, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { FC } from "react";
import { Image } from "../../../components/image";
import GetBankInformationsDocument from "./graphql/getBankInformations.graphql";

interface FormBankAccountProps {
  bankAccount?: Partial<PluginBankAccountInput> | null | undefined;
  onChange: (bankAccount?: PluginBankAccountInput) => any;
}

export const FormBankAccount: FC<FormBankAccountProps> = ({ bankAccount, onChange }) => {
  const { data } = useQuery(GetBankInformationsDocument);

  const handleChange = (key: keyof BankAccount, value: any) => {
    onChange({ ...(bankAccount || {}), [key]: value } as any);
  };

  return (
    <Stack>
      <SimpleGrid>
        <Select
          label={<Trans>Select bank</Trans>}
          searchable
          data={data?.getBankInformations.results.map((v) => ({
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
          label={<Trans>Account number</Trans>}
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
