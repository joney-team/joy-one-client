import { type AppMetadata } from "@/types";
import { primaryColors } from "@joy-one-client/config/colors";
import {
  ComboboxItem,
  createTheme,
  em,
  InputWrapper,
  Modal,
  Notification,
  OptionsFilter,
} from "@mantine/core";
import { LayoutContext } from "../../layout/layout-context";
import { StringUtils } from "../../utils/string.utils";
import { getLocaleConfig } from "../lang/lang-service";
import { zIndexes } from "@joy-one-client/config/layout";

export const getColorShape = (shape?: number) => {
  if (typeof shape === "number" && shape >= 0 && shape <= 9) {
    return shape;
  }

  return 6;
};

export const generateTheme = (metadata: AppMetadata, _: LayoutContext) => {
  return createTheme({
    colors: {
      primary: [
        primaryColors[0],
        primaryColors[1],
        primaryColors[2],
        primaryColors[3],
        primaryColors[4],
        primaryColors[5],
        primaryColors[6],
        primaryColors[7],
        primaryColors[8],
        primaryColors[9],
      ],
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
      Switch: {
        styles: {
          label: {
            fontSize: 12,
          },
        },
      },
      Checkbox: {
        styles: {
          label: {
            fontSize: 13,
            paddingLeft: 8,
          },
        },
      },
      Tooltip: {
        styles: {
          tooltip: {
            fontSize: 13,
          },
        },
      },
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
      Menu: {
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
      },
      MenuItem: {
        defaultProps: {
          px: 12,
          py: 5,
          fz: 15,
        },
      },
      NumberInput: {
        defaultProps: getLocaleConfig().defaultNumberInputProps || {},
      },
      NumberFormatter: {
        defaultProps: getLocaleConfig().defaultNumberInputProps || {},
      },
      TagsInput: {
        defaultProps: {
          splitChars: [",", ";", " ", "|"],
        },
      },
      LoadingOverlay: {
        defaultProps: {
          loaderProps: {
            size: "xs",
          },
        },
      },
      Modal: Modal.extend({
        defaultProps: {
          zIndex: zIndexes.modals,
        },
      }),
    },
  });
};

export const optionsFilter: OptionsFilter = ({ options, search }) => {
  const splittedSearch = search.toLowerCase().trim().split(" ");
  return (options as ComboboxItem[]).filter((option) => {
    const words = StringUtils.removeAccents(option.label).toLowerCase().trim().split(" ");
    return splittedSearch.every((searchWord) => words.some((word) => word.includes(searchWord)));
  });
};
