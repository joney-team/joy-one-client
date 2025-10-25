import { appEntities, dynamicSelectionOperators } from "@/constant";
import { CustomersInput } from "@/modules/customers/components/customers-input";
import { ProductsInput } from "@/modules/products/components/products-input";
import { AppEntity, DynamicSelection, DynamicSelectionOperator } from "@/types";
import { t } from "@lingui/core/macro";
import { Card, Group, InputWrapper, InputWrapperProps, Select } from "@mantine/core";

interface DynamicSelectionInputProps extends Omit<InputWrapperProps, "value" | "onChange"> {
  value?: DynamicSelection;
  onChange?: (value: DynamicSelection) => void;
  fixedEntity?: AppEntity;
}

export const DynamicSelectionInput = ({
  value,
  onChange,
  fixedEntity,
  ...props
}: DynamicSelectionInputProps) => {
  const entity = fixedEntity || value?.entity;

  const _onChange = (
    key: keyof DynamicSelection,
    keyValue: DynamicSelection[keyof DynamicSelection]
  ) => {
    if (!onChange) return;

    const _value = {
      ...value,
      operator: value?.operator || DynamicSelectionOperator.INCLUDES,
      entity: value?.entity || fixedEntity,
    };

    onChange({ ..._value, [key]: keyValue } as DynamicSelection);
  };

  return (
    <InputWrapper {...props}>
      <Card
        withBorder={false}
        shadow="none"
        style={{ borderColor: "var(--mantine-color-default-border)" }}
        bg="gray.1"
        p={8}
      >
        <Group wrap="nowrap" align="flex-start" gap={8}>
          {!fixedEntity && (
            <Select
              placeholder={t`Select`}
              value={entity}
              onChange={(selected) => {
                if (selected) _onChange("entity", selected);
              }}
              data={Object.values(AppEntity).map((entity) => {
                return {
                  value: entity,
                  label: appEntities[entity].name(),
                };
              })}
            />
          )}

          <Select
            w={120}
            value={value?.operator || DynamicSelectionOperator.INCLUDES}
            onChange={(selected) => {
              if (selected) _onChange("operator", selected);
            }}
            data={Object.values(DynamicSelectionOperator).map((operator) => {
              return {
                value: operator,
                label: dynamicSelectionOperators[operator].name(),
              };
            })}
          />

          {(function () {
            if (!value) return null;

            if (value?.entity === AppEntity.PRODUCTS) {
              return (
                <ProductsInput
                  flex={1}
                  value={value?.value || []}
                  onChange={(selected) => {
                    _onChange("value", selected);
                  }}
                />
              );
            }

            if (value?.entity === AppEntity.CUSTOMERS) {
              return (
                <CustomersInput
                  flex={1}
                  value={value?.value || []}
                  onChange={(selected) => {
                    _onChange("value", selected);
                  }}
                />
              );
            }

            return null;
          })()}
        </Group>
      </Card>
    </InputWrapper>
  );
};
