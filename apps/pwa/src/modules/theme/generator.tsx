import { type AppMetadata } from "@/types";
import { primaryColors } from "@joy-one-client/config/colors";
import { zIndexes } from "@joy-one-client/config/layout";
import { DateTime } from "@joy-one-client/utils/date-time";
import {
  Card,
  Checkbox,
  ComboboxItem,
  createTheme,
  em,
  InputWrapper,
  LoadingOverlay,
  Menu,
  MenuItem,
  Modal,
  Notification,
  NumberFormatter,
  NumberInput,
  OptionsFilter,
  Switch,
  TagsInput,
  Tooltip,
} from "@mantine/core";
import { LayoutContext } from "../../layout/layout-context";
import { String } from "../../utils/string.utils";
import { AppLocale } from "../lang/lang-types";

export const getColorShape = (shape?: number) => {
  if (typeof shape === "number" && shape >= 0 && shape <= 9) {
    return shape;
  }

  return 6;
};

export const generateTheme = (metadata: AppMetadata, _: LayoutContext, locale: AppLocale) => {
  return createTheme({
    fontFamily: "Inter, sans-serif",
    colors: {
      primary: primaryColors,
    },
    primaryColor: metadata.appColor || "primary",
    primaryShade: {
      light: getColorShape(metadata.appColorShape) as any,
      dark: (getColorShape(metadata.appColorShape) - 2) as any,
    },
    defaultRadius: "md",
    components: {
      InputWrapper: InputWrapper.extend({
        styles: {
          label: {
            fontSize: 13,
          },
          description: {
            fontSize: 11,
            fontWeight: 300,
            marginBottom: 4,
          },
        },
      }),
      Card: Card.extend({
        defaultProps: {
          shadow: "xs",
          withBorder: false,
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
          px: 12,
          py: 5,
          fz: 15,
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
              paddingTop: 10,
              paddingBottom: 10,
              minHeight: "unset",
            },
          },
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
