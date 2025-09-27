"use client";

import { Button } from "@/components/buttons/button";
import { useRouter } from "@/hooks/use-router";
import { useAuth } from "@/modules/auth/auth-context";
import { UserRole } from "@/modules/users/users-types";
import {
  ActionIcon,
  AppShell,
  Burger,
  Group,
  Image,
  NavLink,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Icon, IconBuilding, IconLogout, IconPlayerPlay, IconTools } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, type FC } from "react";

const allowedRoles = [UserRole.SYS_ADMIN, UserRole.ADMIN];

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
  const [opened, { toggle }] = useDisclosure();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (!allowedRoles.includes(auth.user?.role!))
    return (
      <Stack h="100dvh" w="100dvw" justify="center" align="center">
        <Text>You are not authorized to access this page</Text>
        <Button onClick={() => router.push("/")}>Go Home</Button>
      </Stack>
    );

  return (
    <AppShell
      header={{ height: 40 }}
      navbar={{
        width: 200,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
    >
      <AppShell.Header>
        <Group h="100%" align="center" px={12} gap={8}>
          <Group gap={8} flex={1}>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Image src="/app-icon.png" h={20} w={20} />
            <Title fz={15}>Joy One Admin</Title>
          </Group>

          <ActionIcon variant="subtle" color="gray.6" onClick={auth.signOut}>
            <IconLogout size={18} strokeWidth={1.5} />
          </ActionIcon>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        <Stack gap={8} p={8}>
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

      <AppShell.Main bg="gray.0">{props.children}</AppShell.Main>
    </AppShell>
  );
};
