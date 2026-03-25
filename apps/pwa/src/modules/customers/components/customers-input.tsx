"use client";

import { Trans } from "@lingui/react/macro";
import { ActionIcon, Card, Group, InputWrapperProps, Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { type FC } from "react";
import { CustomerSelector } from "./customer-selector";
import { CustomerFragment } from "../graphql/fragmentCustomer.graphql";

export type CustomerValue = Pick<CustomerFragment, "_id" | "name" | "phone">;

interface CustomersInputProps extends Omit<InputWrapperProps, "value" | "onChange"> {
  value?: CustomerValue[];
  onChange?: (value: CustomerValue[]) => void;
  disabled?: boolean;
}

export const CustomersInput: FC<CustomersInputProps> = (props) => {
  const { value, onChange, disabled, ...rest } = props;
  const _value = value || [];

  const onSelect = (value: CustomerValue) => {
    const isSelected = _value.some((v) => v._id === value._id);
    if (isSelected) {
      onChange?.(_value.filter((v) => v._id !== value._id));
    } else {
      onChange?.([..._value, value]);
    }
  };

  return (
    <CustomerSelector
      {...rest}
      onSelect={(value) => onSelect(value as CustomerValue)}
      excludeIds={_value.map((v) => v._id)}
      target={(ctx) => {
        return (
          <Card
            p={8}
            className="clickable"
            w="100%"
            onClick={ctx.toggle}
            withBorder
            shadow="none"
            style={{ borderColor: "var(--mantine-color-default-border)" }}
          >
            {_value.length === 0 && (
              <Text fz={11} c="gray" fw={400}>
                <Trans>Search customers</Trans>
              </Text>
            )}

            {_value.length > 0 && (
              <Group gap={10}>
                {_value.map((v) => (
                  <Card p={2} shadow="none" bg="gray.1" radius={4} key={v._id}>
                    <Group gap={5} wrap="nowrap" pl={6}>
                      <Text fz={14}>{v.name}</Text>

                      <ActionIcon
                        size="sm"
                        color="gray"
                        variant="subtle"
                        radius={100}
                        onClick={() => onSelect(v)}
                      >
                        <IconX size={14} />
                      </ActionIcon>
                    </Group>
                  </Card>
                ))}
              </Group>
            )}
          </Card>
        );
      }}
    />
  );
};
