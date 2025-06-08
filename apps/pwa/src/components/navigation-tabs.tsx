import { useRouter } from "@/hooks/use-router";
import { useLayout } from "@/layout/layout-context";
import { t } from "@/modules/lang/lang-service";
import { ButtonProps, Group, ScrollArea } from "@mantine/core";
import { Icon } from "@tabler/icons-react";
import { FC } from "react";
import { Button } from "./buttons/button";
import Link from "next/link";
import { useColor } from "@/modules/theme/use-color";
import { useColorScheme } from "@/modules/theme/use-color-scheme";

export const NavigationTabsConfig = {
  height: 44,
};

export interface NavigationTabsProps {
  activeTab?: string;
  onChange?: (tab: string) => void;
  tabs: {
    id: string;
    exact?: boolean;
    name: string;
    icon?: Icon;
    rightSection?: React.ReactNode;
  }[];
}

const buttonProps: ButtonProps = {
  variant: "subtle",
  size: "compact-sm",
  color: "var(--mantine-color-text)",
  radius: 5,
  py: 0,
  px: 8,
  fw: 500,
};

export const NavigationTabs: FC<NavigationTabsProps> = (props) => {
  const layout = useLayout();
  const router = useRouter();
  const color = useColor();
  const colorScheme = useColorScheme();

  return (
    <>
      <ScrollArea
        type="never"
        scrollbars="x"
        h={NavigationTabsConfig.height}
        style={{
          borderBottom: layout.border,
          background: "var(--mantine-color-body)",
          width: "100%",
          overflowX: "auto",
        }}
      >
        <Group px={16} gap={0} w="max-content" wrap="nowrap" h={NavigationTabsConfig.height}>
          {props.tabs.map((tab) => {
            const isActive = props.activeTab
              ? props.activeTab === tab.id
              : tab.exact
              ? router.pathname === tab.id
              : router.pathname.includes(tab.id);

            return (
              <Group
                key={tab.id}
                px={3}
                gap={0}
                justify="center"
                h="100%"
                style={{
                  borderBottom: `3px solid ${
                    isActive ? (colorScheme === "dark" ? color("dark.3") : color("dark")) : "transparent"
                  }`,
                }}
              >
                {!!props.onChange ? (
                  <Button {...buttonProps} leftIcon={tab.icon} onClick={() => props.onChange?.(tab.id!)}>
                    {t(tab.name)}
                    {tab.rightSection}
                  </Button>
                ) : (
                  <Link href={tab.id}>
                    <Button {...buttonProps} leftIcon={tab.icon}>
                      {t(tab.name)}
                      {tab.rightSection}
                    </Button>
                  </Link>
                )}
              </Group>
            );
          })}
        </Group>
      </ScrollArea>
    </>
  );
};
