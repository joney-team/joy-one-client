"use client";

import { tl } from "@/modules/lang/lang-service";
import { useColor } from "@/modules/theme/use-color";
import { Box, Group, MantineStyleProp, Text, alpha, em } from "@mantine/core";
import { useResizeObserver } from "@mantine/hooks";
import { Icon } from "@tabler/icons-react";
import { CSSProperties, FC, Fragment, useEffect, useState } from "react";

export interface AppTabItem {
  id: string;
  icon?: Icon;
  name?: string;
  isHide?: boolean;
  component?: FC<any>;
  activeColor?: string;
}

export interface TabsProps {
  onChange: (tab: string) => void;
  active: string;
  tabs: AppTabItem[];
  spacing?: number;
  type?: "default" | "circle-icons";
  tabStyle?: CSSProperties;
}

export const Tabs: FC<TabsProps> = (props) => {
  const color = useColor();
  const [ref, rect] = useResizeObserver();
  const [itemSize, setItemSize] = useState({ w: 0, h: 0 });
  const tabs = props.tabs.filter((v) => !v.isHide);
  const type = props.type || "default";
  const spacing = props.spacing || 0;

  const fetchSize = () => {
    const width = ref.current ? ref.current.offsetWidth - spacing * (tabs.length - 1) : 0;
    setItemSize({
      w: width / tabs.length,
      h: ref.current?.offsetHeight || 0,
    });
  };

  useEffect(() => {
    fetchSize();
    setTimeout(fetchSize, 50);
  }, [tabs.length, rect]);

  const calculateActivePos = () => {
    const activatedIndex = tabs.findIndex((tab) => tab.id === props.active);
    if (activatedIndex === 0) return 0;

    let temp = itemSize.w * activatedIndex;
    if (spacing > 0) temp += spacing * activatedIndex;
    return temp;
  };

  const availableTabs = tabs.filter((tab) => !tab.component);

  return (
    <Fragment>
      <Box
        style={{
          maxWidth: "100%",
          border: `1px solid ${alpha("black", 0.1)}`,
          position: "relative",
          minWidth: "max-content",
          padding: 0,
          ...(type === "default"
            ? {
                borderRadius: 5,
              }
            : {
                borderRadius: 100,
              }),
          ...props.tabStyle,
        }}
      >
        <Group
          className="tabs-menu"
          justify="space-around"
          style={{
            position: "relative",
            maxWidth: "100%",
            gap: spacing,
          }}
          h={35}
          wrap="nowrap"
          ref={ref}
        >
          <Box
            style={{
              width: itemSize.w,
              height: itemSize.h,
              position: "absolute",
              top: 0,
              left: calculateActivePos(),
              zIndex: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              transition: "left 0.3s ease",
            }}
          >
            <div
              style={{
                background: color(
                  props.tabs.find((tab) => tab.id === props.active)?.activeColor || "primary"
                ),
                boxShadow: "0px 1px 1px #00000010",
                width: "100%",
                height: "100%",
                ...(type === "default"
                  ? {
                      borderRadius: 5,
                    }
                  : {
                      borderRadius: "100%",
                    }),
              }}
            />
          </Box>

          {tabs.map((tab) => {
            return (
              <TabItem
                key={tab.id}
                tab={tab}
                isActive={props.active === tab.id}
                onClick={() => props.onChange(tab.id)}
                tabsProps={props}
              />
            );
          })}
        </Group>
      </Box>

      {availableTabs.length > 0 &&
        availableTabs.map((tab, index) => {
          if (!tab.component) return null;

          const isActive = props.active === tab.id;

          return (
            <Box
              key={`${tab.id}_${index}`}
              style={{
                zIndex: isActive ? 1 : 0,
                opacity: isActive ? 1 : 0,
                display: isActive ? "block" : "none",
              }}
            >
              <tab.component changeTab={props.onChange} />
            </Box>
          );
        })}
    </Fragment>
  );
};

const TabItem: FC<{
  tab: AppTabItem;
  isActive: boolean;
  onClick: () => void;
  tabsProps: TabsProps;
}> = (props) => {
  const color = useColor();

  const statusStyle: MantineStyleProp = props.isActive
    ? {
        cursor: "default",
      }
    : {
        cursor: "pointer",
      };

  if (props.tab.isHide) return null;

  return (
    <Group
      key={props.tab.id}
      align="center"
      justify="center"
      gap={5}
      onClick={props.onClick}
      style={{
        flex: 1,
        position: "relative",
        zIndex: 1,
        ...statusStyle,
        ...(props.tabsProps.type === "default"
          ? {
              padding: 5,
            }
          : {
              padding: 5,
            }),
      }}
    >
      {!!props.tab.icon && (
        <props.tab.icon
          stroke={1.8}
          color={color(props.isActive ? "white" : "dark")}
          size={20}
          style={{ transition: "color 0.3s ease" }}
        />
      )}

      {!!props.tab.name && props.tabsProps.type !== "circle-icons" && (
        <Text
          ta="center"
          c={props.isActive ? "white" : "dark"}
          style={{ transition: "color 0.3s ease" }}
          fw={600}
          fz={em(12)}
        >
          {tl(props.tab.name)}
        </Text>
      )}
    </Group>
  );
};
