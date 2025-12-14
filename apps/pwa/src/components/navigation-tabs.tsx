"use client";

import { useRouter } from "@/hooks/use-router";
import { useWorkspaceLayout } from "@/layout/hooks/use-workspace-layout";
import { useColor } from "@/modules/theme/use-color";
import { useColorScheme } from "@/modules/theme/use-color-scheme";
import { ButtonProps, Group, ScrollArea } from "@mantine/core";
import { Icon } from "@tabler/icons-react";
import Link from "next/link";
import { ComponentType, FC, Fragment, ReactNode } from "react";
import { Button } from "./buttons/button";

export const navigationTabsConfig = {
  height: 44,
};

export interface NavigationTabsProps {
  activeTab?: string;
  onChange?: (tab: string) => void;
  rightSection?: ComponentType;
  tabs: {
    id: string;
    exact?: boolean;
    name: ReactNode;
    icon?: Icon;
    rightSection?: React.ReactNode;
  }[];
}

const buttonProps: ButtonProps = {
  variant: "subtle",
  size: "sm",
  color: "var(--mantine-color-text)",
  radius: 5,
  py: 0,
  px: 8,
  fw: 500,
};

export const NavigationTabs: FC<NavigationTabsProps> = (props) => {
  const { rightSection: RightSection } = props;
  const router = useRouter();
  const color = useColor();
  const colorScheme = useColorScheme();
  const workspaceLayout = useWorkspaceLayout();

  return (
    <Group
      style={{
        borderBottom: `1px solid ${workspaceLayout.dividerColor}`,
        background: "var(--mantine-color-body)",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      <ScrollArea.Autosize type="never" scrollbars="x" h={navigationTabsConfig.height} flex={1}>
        <Group px="md" gap={0} w="max-content" wrap="nowrap" h={navigationTabsConfig.height}>
          {props.tabs.map((tab) => {
            const isActive = props.activeTab
              ? props.activeTab === tab.id
              : tab.exact
              ? router.pathname === tab.id
              : router.pathname.includes(tab.id);

            return (
              <Group
                key={tab.id}
                px={2}
                gap={0}
                justify="center"
                h="100%"
                style={{
                  borderBottom: `3px solid ${
                    isActive
                      ? colorScheme === "dark"
                        ? color("dark.3")
                        : color("dark")
                      : "transparent"
                  }`,
                }}
              >
                {!!props.onChange ? (
                  <Button
                    h={28}
                    component="div"
                    {...buttonProps}
                    leftIcon={tab.icon}
                    onClick={() => props.onChange?.(tab.id!)}
                  >
                    {tab.name}
                    {tab.rightSection}
                  </Button>
                ) : (
                  <Link href={tab.id}>
                    <Button {...buttonProps} leftIcon={tab.icon} component="div">
                      {tab.name}
                      {tab.rightSection}
                    </Button>
                  </Link>
                )}
              </Group>
            );
          })}
        </Group>
      </ScrollArea.Autosize>

      {RightSection && <RightSection />}
    </Group>
  );
};
