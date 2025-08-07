"use client";

import { t } from "@/modules/lang/lang-service";
import { useColor } from "@/modules/theme/use-color";
import { onError } from "@/utils/exceptions.utils";
import { Button as ButtonMantine, ButtonProps as ButtonPropsMantine } from "@mantine/core";
import { Icon } from "@tabler/icons-react";
import React, { FC, useState } from "react";

export interface ButtonProps extends Omit<ButtonPropsMantine, "isGradient"> {
  id?: string;
  children?: React.ReactNode;
  component?: any;
  href?: string;
  onClick?: (e: any) => any;
  weight?: string | number;
  type?: "button" | "submit" | "reset";
  isGradient?: boolean;
  leftIcon?: Icon;
  rightIcon?: Icon;
  iconSize?: number;
  iconSpacing?: number;
  iconStrokeWidth?: number;
  action?: boolean;
  visible?: boolean;
  label?: string;
}

export const Button: FC<ButtonProps> = (props) => {
  const {
    id,
    children,
    component,
    href,
    onClick: propsOnClick,
    weight,
    type,
    isGradient,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    iconSize: propsIconSize,
    iconSpacing: propsIconSpacing,
    iconStrokeWidth: propsIconStrokeWidth,
    action,
    visible,
    label,
    ...rest
  } = props;

  const [funcLoading, setFuncLoading] = useState(false);
  const color = useColor();

  const onClick = async (e: any) => {
    if (!propsOnClick) return;
    setFuncLoading(true);

    try {
      await propsOnClick(e);
    } catch (error) {
      onError(error);
    }

    setFuncLoading(false);
  };

  const isLoading = props.loading || funcLoading;

  if (visible === false) return null;

  const h = props.h;
  const miw = props.miw || (action || props.type === "submit" ? 180 : props.miw);
  const radius = props.radius;

  const defaultIconSpacings = {
    xs: -3,
    "compact-xs": -10,
    "compact-sm": -5,
    default: -7,
  };

  const iconSpacing =
    typeof propsIconSpacing === "number"
      ? propsIconSize
      : (defaultIconSpacings as any)[props.size || ""] || defaultIconSpacings["default"];

  const defaultIconSizes = {
    xs: 16,
    "compact-xs": 16,
    "compact-sm": 18,
    default: 20,
  };

  const iconSize =
    typeof props.iconSize === "number"
      ? props.iconSize
      : (defaultIconSizes as any)[props.size || ""] || defaultIconSizes["default"];

  const defaultFontSizes = {
    xs: 13,
    "compact-xs": 12,
    "compact-sm": 13,
    default: 14,
  };

  const fontSize =
    typeof props.fz !== "undefined"
      ? props.fz
      : (defaultFontSizes as any)[props.size || ""] || defaultFontSizes["default"];

  const defaultSconStrokeWidth = {
    xs: 2,
    default: 1.6,
  };
  const iconStrokeWidth =
    typeof propsIconStrokeWidth === "number"
      ? propsIconStrokeWidth
      : (defaultSconStrokeWidth as any)[props.size || ""] || defaultSconStrokeWidth["default"];

  const getColor = (c?: string) => {
    if (c === "joyone") return "primary";
    return color(c || "primary");
  };

  return (
    <ButtonMantine
      {...rest}
      component={component}
      href={href}
      leftSection={
        LeftIcon ? (
          <LeftIcon
            size={iconSize}
            strokeWidth={iconStrokeWidth}
            style={{ marginRight: iconSpacing }}
          />
        ) : (
          props.leftSection
        )
      }
      rightSection={
        RightIcon ? (
          <RightIcon
            size={iconSize}
            strokeWidth={iconStrokeWidth}
            style={{ marginLeft: iconSpacing }}
          />
        ) : (
          props.rightSection
        )
      }
      h={h}
      miw={miw}
      radius={radius}
      loading={isLoading}
      disabled={isLoading || props.disabled}
      onClick={onClick}
      gradient={
        isGradient
          ? {
              from: color("primary.8"),
              to: color("primary.6"),
              deg: 45,
            }
          : props.gradient
      }
      variant={isGradient ? "gradient" : props.variant}
      styles={{
        ...props.styles,
        label: {
          fontSize,
          ...(props.styles || ({} as any)).label,
        },
      }}
      color={getColor(props.color)}
    >
      {props.label ? t(props.label) : children}
    </ButtonMantine>
  );
};
