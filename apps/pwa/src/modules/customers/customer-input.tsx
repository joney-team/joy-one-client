import { Avatar } from "@/components/avatar";
import { Renderer } from "@/components/renderer";
import { SelectorTarget } from "@/components/selector";
import { CustomerSelector } from "@/modules/customers/customer-selector";
import { CustomerShortInfo } from "@/modules/customers/customer-types";
import { ActionIcon, Card, em, Group, InputWrapperProps, Stack, Text } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconUserPlus, IconX } from "@tabler/icons-react";
import { FC } from "react";

interface CustomerInputProps extends Omit<InputWrapperProps, "value" | "onSelect" | "onChange"> {
  value?: CustomerShortInfo;
  onSelect?: (value?: CustomerShortInfo) => void;
  onChange?: (value?: CustomerShortInfo) => void;
  disabled?: boolean;
  clearable?: boolean;
  renderValue?: SelectorTarget<CustomerShortInfo>;
}

export const CustomerInput: FC<CustomerInputProps> = (props) => {
  const { onSelect, onChange, disabled, clearable, renderValue, ...rest } = props;

  const _onSelect = (value?: CustomerShortInfo) => {
    onSelect?.(value);
    onChange?.(value);
  };

  const hover = useHover();

  return (
    <CustomerSelector
      {...rest}
      onSelect={_onSelect}
      target={(ctx) => {
        if (renderValue) return renderValue(ctx);

        const { value, toggle, theme } = ctx;

        return (
          <Group
            p={props.p}
            flex={props.flex}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle();
            }}
            className={!disabled ? "clickable" : ""}
          >
            {(function () {
              if (!value && !disabled)
                return (
                  <ActionIcon
                    color="gray.4"
                    size={34}
                    variant="outline"
                    radius={150}
                    disabled={disabled}
                    onClick={toggle}
                  >
                    <IconUserPlus size={18} />
                  </ActionIcon>
                );

              if (!value) return null;

              return (
                <Card
                  ref={hover.ref}
                  p={2}
                  style={{
                    borderColor: theme.colors.gray[4],
                    borderWidth: "1px",
                    boxShadow: "none",
                    position: "relative",
                    overflow: "visible",
                    cursor: "pointer",
                  }}
                  withBorder
                  radius={150}
                  onClick={toggle}
                >
                  <Group gap={8} wrap="nowrap">
                    <Avatar customer={value} size={em(28)} radius="xl" />

                    <Stack gap={2} pr={12}>
                      <Text fz={10} fw={600}>
                        {value.name}
                      </Text>
                      {value.phone && (
                        <Text fz={8} fw={500} mt={-2}>
                          {value.phone}
                        </Text>
                      )}
                    </Stack>
                  </Group>

                  <Renderer visible={!!clearable && !!!disabled && hover.hovered}>
                    <ActionIcon
                      color="dark.2"
                      radius={100}
                      size={em(15)}
                      style={{
                        position: "absolute",
                        right: -4,
                        top: -4,
                        border: `1.5px solid white`,
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        _onSelect(undefined);
                      }}
                    >
                      <IconX size={7} strokeWidth={4} />
                    </ActionIcon>
                  </Renderer>
                </Card>
              );
            })()}
          </Group>
        );
      }}
    />
  );
};
