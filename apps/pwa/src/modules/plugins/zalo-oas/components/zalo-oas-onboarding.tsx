import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { Container } from "@/components/container";
import { tl } from "@/modules/lang/lang-service";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Group, Image, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconCirclesRelation, IconLinkPlus } from "@tabler/icons-react";
import { type FC } from "react";
import { connectPluginZalo } from "../zalo-oas-service";

export const ZaloOasOnboarding: FC = () => {
  const workspace = useWorkspace();
  const color = useColor();
  return (
    <Container p={16}>
      <Stack align="center" py={20}>
        <Group gap={30} mb={20}>
          <Avatar workspace={workspace.userMember.workspace} size={55} />
          <ThemeIcon variant="transparent" size="lg" color="dark">
            <IconCirclesRelation size={50} />
          </ThemeIcon>
          <Image w={55} src="/images/plugins-zalo-oa.svg" />
        </Group>

        <Title mt={-10} ta="center" order={2} fw={300} c={color("primary")}>
          {tl("connect")} <strong>Zalo OAs</strong>
        </Title>

        <Text ta="center">{tl("connect_zalo_oa_desc")}</Text>

        <Button mt={10} type="submit" onClick={() => connectPluginZalo()} leftIcon={IconLinkPlus}>
          {tl("connect")}
        </Button>
      </Stack>
    </Container>
  );
};
