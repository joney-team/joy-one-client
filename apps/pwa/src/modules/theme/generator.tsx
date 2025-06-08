import { ComboboxItem, createTheme, em, OptionsFilter } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { getColorShape, JOYONE_COLOR } from "../../configs/colors.config";
import { LayoutContext } from "../../layout/layout-context";
import { getLocaleConfig } from "../lang/lang-service";
import { StringUtils } from "../../utils/string.utils";
import { type AppMetadata } from "@/types";

export const generateTheme = (metadata: AppMetadata, layout: LayoutContext) => {
  return createTheme({
    colors: {
      primary: JOYONE_COLOR,
    },
    primaryColor: metadata.appColor || "primary",
    primaryShade: {
      light: getColorShape(metadata.appColorShape) as any,
      dark: (getColorShape(metadata.appColorShape) - 2) as any,
    },
    defaultRadius: 8,
    components: {
      InputWrapper: {
        styles: {
          label: {
            fontSize: 12,
          },
          description: {
            fontSize: 11,
          },
        },
      },
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
      Modal: {
        defaultProps: {
          styles: {
            header: {
              height: 50,
              paddingTop: 10,
              paddingBottom: 10,
              paddingLeft: 12,
              minHeight: 50,
            },
          },
          closeButtonProps: {
            icon: <IconX strokeWidth={1.5} size={20} />,
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
      Notification: {
        styles: {
          root: {
            alignItems: "start",
            gap: 0,
          },
          icon: {
            marginTop: em(5),
          },
        },
      },
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
    },
    spacing: {
      lg: `${16}px`,
      xl: `${16}px`,
      md: `${16}px`,
      sm: `${16}px`,
      xs: `${16}px`,
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
