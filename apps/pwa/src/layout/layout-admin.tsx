"use client";

import { Button } from "@/components/buttons/button";
import { ColorSchemes } from "@/components/color-schemes";
import { UserRole } from "@/graphql/enums.graphql";
import { useRouter } from "@/hooks/use-router";
import { useAuth } from "@/modules/auth/auth-context";
import { useColor } from "@/modules/theme/use-color";
import { ActionIcon, AppShell, Group, Image, NavLink, Stack, Text } from "@mantine/core";
import { Icon, IconBuilding, IconLogout, IconPlayerPlay, IconTools } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, type FC } from "react";

const allowedRoles: UserRole[] = [UserRole.SysAdmin, UserRole.Admin];

const navItems: {
  route: string;
  name: string;
  icon: Icon;
}[] = [
  {
    route: "/tools",
    name: "Tools",
    icon: IconTools,
  },
  {
    route: "/workspaces",
    name: "Workspaces",
    icon: IconBuilding,
  },
  {
    route: "/playground",
    name: "Playground",
    icon: IconPlayerPlay,
  },
];

export const LayoutAdmin: FC<PropsWithChildren> = (props) => {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const color = useColor();

  if (!allowedRoles.includes(auth.user?.role!))
    return (
      <Stack h="100dvh" w="100dvw" justify="center" align="center">
        <Text>You are not authorized to access this page</Text>
        <Button onClick={() => router.push("/")}>Go Home</Button>
      </Stack>
    );

  return (
    <AppShell
      navbar={{
        width: 200,
        breakpoint: "sm",
      }}
      bg={color("bg")}
    >
      <AppShell.Navbar>
        <Stack gap={8} p={6}>
          <Group h="100%" align="center" px={12} gap={3} wrap="nowrap">
            <Group gap={8} flex={1}>
              <Image src="/app-icon.png" h={24} w={24} />
              <Text fz="sm" fw={500} truncate>
                Admin
              </Text>
            </Group>

            <Group gap={0}>
              <ColorSchemes />

              <ActionIcon variant="subtle" color="gray.6" onClick={auth.signOut}>
                <IconLogout size={18} strokeWidth={1.5} />
              </ActionIcon>
            </Group>
          </Group>

          {navItems.map((item) => {
            const routeName = `/admin${item.route}`;
            return (
              <NavLink
                component={Link}
                href={routeName}
                key={routeName}
                active={routeName === pathname}
                variant="light"
                label={item.name}
                leftSection={<item.icon size={18} strokeWidth={1.5} />}
                fw={500}
              />
            );
          })}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>{props.children}</AppShell.Main>
    </AppShell>
  );
};
