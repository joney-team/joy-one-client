"use client";

import type { AppLocale, AppMetadata } from "@/graphql/types.graphql";
import config from "@joy-one-client/config";
import { zIndexes } from "@joy-one-client/config/layout";
import { DateTime } from "@joy-one-client/utils/date-time";
import { t } from "@lingui/core/macro";
import { generateColors, generateColorsMap } from "@mantine/colors-generator";
import {
  ActionIcon,
  Badge,
  Card,
  Checkbox,
  ComboboxItem,
  createTheme,
  em,
  InputWrapper,
  LoadingOverlay,
  MantinePrimaryShade,
  Menu,
  MenuItem,
  Modal,
  Notification,
  NumberFormatter,
  NumberInput,
  OptionsFilter,
  Select,
  Switch,
  TagsInput,
  Tooltip,
} from "@mantine/core";
import { String } from "../../utils/string.utils";

export const generateTheme = (args: {
  metadata: AppMetadata;
  locale: AppLocale;
  colorName?: string;
}) => {
  const { metadata, locale } = args;

  const primaryColor =
    metadata.color && metadata.color.startsWith("#") ? metadata.color : config.PRIMARY_COLOR;

  const primaryColors = generateColors(primaryColor);

  const { baseColorIndex } = generateColorsMap(primaryColor);

  const primaryColorName = args.colorName || "primary";
  const primaryShade = metadata.colorShape || baseColorIndex;

  return createTheme({
    fontFamily: "Inter, sans-serif",
    colors: {
      [primaryColorName]: primaryColors,
    },
    primaryColor: primaryColorName,
    primaryShade: {
      light: primaryShade,
      dark: primaryShade - 2,
    } as MantinePrimaryShade,
    fontWeights: {
      medium: "500",
    },
    defaultRadius: "md",
    shadows: {
      xs: "lch(0 0 0 / 0.022) 0px 3px 6px -2px, lch(0 0 0 / 0.044) 0px 1px 1px",
    },
    components: {
      InputWrapper: InputWrapper.extend({
        styles: {
          label: {
            fontSize: 12,
          },
          description: {
            fontSize: 11,
            fontWeight: 300,
            marginBottom: 4,
          },
        },
      }),
      Badge: Badge.extend({
        styles: {
          label: {
            textBoxTrim: "unset",
          },
        },
      }),
      Card: Card.extend({
        defaultProps: {
          shadow: "xs",
          withBorder: false,
        },
        styles: {
          root: {
            overflow: "visible",
          },
        },
      }),
      Switch: Switch.extend({
        styles: {
          label: {
            fontSize: 13,
          },
        },
      }),
      Checkbox: Checkbox.extend({
        styles: {
          label: {
            fontSize: 13,
            paddingLeft: 8,
          },
        },
      }),
      Tooltip: Tooltip.extend({
        defaultProps: {
          openDelay: 300,
        },
        styles: {
          tooltip: {
            fontSize: 13,
          },
        },
      }),
      Notification: Notification.extend({
        styles: {
          root: {
            alignItems: "start",
            gap: 0,
          },
          icon: {
            marginTop: em(5),
          },
        },
      }),
      Menu: Menu.extend({
        styles: {
          dropdown: {
            boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.2)",
          },
        },
        defaultProps: {
          position: "bottom-start",
          shadow: "xs",
          offset: 5,
        },
      }),
      MenuItem: MenuItem.extend({
        defaultProps: {
          px: 8,
          py: 6,
          fz: "sm",
        },
      }),
      NumberInput: NumberInput.extend({
        defaultProps: DateTime.getSeparators(locale),
      }),
      NumberFormatter: NumberFormatter.extend({
        defaultProps: DateTime.getSeparators(locale),
      }),
      TagsInput: TagsInput.extend({
        defaultProps: {
          splitChars: [",", ";", " ", "|"],
        },
      }),
      LoadingOverlay: LoadingOverlay.extend({
        defaultProps: {
          loaderProps: {
            size: "xs",
          },
        },
      }),
      Modal: Modal.extend({
        defaultProps: {
          zIndex: zIndexes.commonModals,
          styles: {
            header: {
              paddingTop: 16,
              paddingBottom: 10,
              minHeight: "unset",
            },
            title: {
              flex: 1,
            },
          },
        },
      }),
      Select: Select.extend({
        defaultProps: {
          placeholder: t`Select`,
        },
      }),
      ActionIcon: ActionIcon.extend({
        defaultProps: {
          component: "div",
        },
      }),
    },
  });
};

export const optionsFilter: OptionsFilter = ({ options, search }) => {
  const splittedSearch = search.toLowerCase().trim().split(" ");
  return (options as ComboboxItem[]).filter((option) => {
    const words = String.removeAccents(option.label).toLowerCase().trim().split(" ");
    return splittedSearch.every((searchWord) => words.some((word) => word.includes(searchWord)));
  });
};
