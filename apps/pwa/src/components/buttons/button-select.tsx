"use client";

import { useLayout } from "@/layout/layout-context";
import { useColor } from "@/modules/theme/use-color";
import {
  Center,
  Group,
  MantineSize,
  Menu,
  MenuProps,
  ThemeIcon,
  ThemeIconProps,
  em,
  rgba,
} from "@mantine/core";
import { useClickOutside, useDisclosure, useHover } from "@mantine/hooks";
import { Icon, IconCheck, IconX } from "@tabler/icons-react";
import { FC } from "react";
import { NumberFormat } from "../format/number-format";
import { Button } from "./button";

interface ButtonSelectProps {
  icon: Icon;
  label?: React.ReactNode;
  isActive?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  onClick?: () => void;
  onClear?: () => void;
  quantity?: number;
  iconClassName?: string;
  iconStyle?: React.CSSProperties;
  hideOptionLabel?: boolean;
  autoHideLabel?: boolean;
  indicator?: number;
  size?: any | MantineSize;
  iconSize?: number;
  iconStrokeWidth?: number;
  iconVariant?: "filled" | "light" | "outline" | "transparent";
  options?: {
    label: React.ReactNode;
    value: string;
    icon?: Icon;
    iconProps?: ThemeIconProps;
    onClick?: () => void;
    activeColor?: string;
    leftSession?: React.ReactNode;
  }[];
  mutiltiple?: boolean;
  value?: string | string[] | null;
  onChange?: (value?: string | string[]) => void;
  dropdown?: FC<{ close: () => void }>;
  menuProps?: MenuProps;
  dropdownRadius?: number;
  enabled?: boolean;
}

export const ButtonSelect: FC<ButtonSelectProps> = (props) => {
  const [opened, { open, close }] = useDisclosure(false);
  const color = useColor();
  const ref = useClickOutside(() => close());
  const selected =
    props.options?.filter(
      (opt) => opt.value === props.value || (opt.value && props.value?.includes(opt.value))
    ) || [];
  const hasSelected = selected.length > 0;
  const hover = useHover();
  const viewport = useLayout();
  const iconStrokeWidth = props.iconStrokeWidth || 1.8;

  const activeColor = color(props.activeColor || selected[0]?.activeColor || "primary");
  const isActive = !!props.isActive || (hasSelected && !!props.value);

  const renderLabel = () => {
    if (selected.length === 0 || props.mutiltiple || props.hideOptionLabel)
      return props.label || "";
    if (!props.label || !!props.autoHideLabel) return selected[0]?.label;
    return `${props.label}: ${selected[0]?.label}`;
  };

  const label = renderLabel();

  const onChange = (value: string) => {
    if (props.onClick) props.onClick();
    if (!props.options || !props.onChange) return;

    const isSelected = props.value === value || props.value?.includes(value);
    if (props.mutiltiple) {
      if (isSelected) {
        const _value = selected.filter((opt) => opt.value !== value).map((opt) => opt.value);

        props.onChange(_value as string[]);
      } else {
        const _value = [...selected.map((v) => v.value).filter((v) => !!v)];
        _value.push(value);
        props.onChange(_value as string[]);
      }
    } else {
      props.onChange(value);
      close();
    }
  };

  const _onModal = (e?: any) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (props.onClick) props.onClick();
    open();
  };

  const ActiveIcon = props.mutiltiple ? props.icon : selected[0]?.icon || props.icon;

  if (props.enabled === false) return null;

  return (
    <Menu opened={opened} disabled={!props.options && !props.dropdown} {...props.menuProps}>
      <Menu.Target>
        <Group ref={hover.ref}>
          {label ? (
            <Button
              size={"compact-md"}
              h={props.size || 34}
              color={isActive ? activeColor : props.inactiveColor || "var(--mantine-color-dimmed)"}
              variant="outline"
              radius={100}
              leftSection={
                <ActiveIcon
                  className={props.iconClassName}
                  size={props.iconSize || 18}
                  strokeWidth={iconStrokeWidth || 1.5}
                  style={{
                    ...{ marginRight: -10, marginLeft: 3 },
                    ...props.iconStyle,
                  }}
                />
              }
              styles={{
                root: {
                  backgroundColor: isActive ? rgba(activeColor, 0.1) : undefined,
                  position: "relative",
                  overflow: "visible",
                },
                label: {
                  fontSize: 11,
                },
              }}
              onClick={_onModal}
            >
              <Group gap={5}>
                {label}

                {((props.mutiltiple && selected.length > 0) ||
                  props.indicator ||
                  (props.quantity && props.quantity > 0)) && (
                  <Center
                    w={16}
                    h={16}
                    bg={activeColor}
                    style={{ borderRadius: 100 }}
                    fz={8}
                    fw={700}
                    c="white"
                  >
                    <NumberFormat
                      value={props.indicator || selected.length || props.quantity || 0}
                    />
                  </Center>
                )}

                {!!props.onClear && isActive && (hover.hovered || viewport.view !== "desktop") && (
                  <ThemeIcon
                    color="dark.2"
                    radius={100}
                    size={16}
                    style={{
                      position: "absolute",
                      right: -5,
                      top: -5,
                      border: `1px solid white`,
                      cursor: "pointer",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      props.onClear?.();
                    }}
                  >
                    <IconX size={7} strokeWidth={4} />
                  </ThemeIcon>
                )}
              </Group>
            </Button>
          ) : (
            <Group style={{ position: "relative" }}>
              <ThemeIcon
                size={props.size}
                color={isActive ? activeColor : props.inactiveColor || "gray"}
                variant={props.iconVariant || "outline"}
                radius={100}
                onClick={_onModal}
                style={{ cursor: "pointer" }}
              >
                <ActiveIcon
                  className={props.iconClassName}
                  size={props.iconSize || 18}
                  strokeWidth={iconStrokeWidth}
                  style={{
                    ...props.iconStyle,
                  }}
                />
              </ThemeIcon>

              {!!props.onClear && isActive && (hover.hovered || viewport.view !== "desktop") && (
                <ThemeIcon
                  color="dark.2"
                  radius={100}
                  size={16}
                  style={{
                    position: "absolute",
                    right: -5,
                    top: -5,
                    border: `1px solid white`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    props.onClear?.();
                  }}
                >
                  <IconX size={7} strokeWidth={4} />
                </ThemeIcon>
              )}
            </Group>
          )}
        </Group>
      </Menu.Target>

      {(props.dropdown || (props.options && props.options?.length > 0)) && (
        <Menu.Dropdown
          p={5}
          ref={ref}
          styles={{
            dropdown: {
              borderRadius: props.dropdownRadius,
              overflow: props.dropdownRadius ? "hidden" : undefined,
            },
          }}
        >
          {props.dropdown ? <props.dropdown close={close} /> : null}

          {props.options?.map((opt, index) => {
            const isSelected =
              opt.value === props.value || (opt.value && props.value?.includes(opt.value));

            return (
              <Menu.Item
                key={index}
                variant="outline"
                w="100%"
                fz={em(15)}
                style={{ borderWidth: 0.5 }}
                leftSection={(function () {
                  if (opt.leftSession) return opt.leftSession;
                  if (opt.icon)
                    return (
                      <ThemeIcon
                        variant="subtle"
                        color={color(opt.activeColor)}
                        {...opt.iconProps}
                        size={22}
                        ml={-3}
                      >
                        <opt.icon size={20} />
                      </ThemeIcon>
                    );
                })()}
                onClick={() => {
                  if (opt.onClick) opt.onClick();
                  onChange(opt.value);
                }}
                rightSection={
                  isSelected && (
                    <ThemeIcon variant="transparent" radius={100} size={16}>
                      <IconCheck strokeWidth={3} />
                    </ThemeIcon>
                  )
                }
              >
                {opt.label}
              </Menu.Item>
            );
          })}
        </Menu.Dropdown>
      )}
    </Menu>
  );
};
