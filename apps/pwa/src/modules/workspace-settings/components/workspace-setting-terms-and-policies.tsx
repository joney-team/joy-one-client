"use client";

import { useLingui } from "@lingui/react/macro";
import { ActionIcon, Anchor, Card, Group, SimpleGrid, Text } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import Link from "next/link";
import { FC } from "react";

export const WorkspaceTermsAndPolicies: FC = () => {
  const { t } = useLingui();

  const docNames: Record<string, () => string> = {
    "terms-of-service": () => t`Terms of service`,
    "privacy-policy": () => t`Privacy policy`,
  };

  return (
    <SimpleGrid cols={{ md: 2 }}>
      {Object.entries(docNames).map(([doc, name]) => (
        <Anchor key={doc} component={Link} href={`/docs/${doc}`}>
          <Card withBorder shadow="none">
            <Group justify="space-between">
              <Text>{name()}</Text>

              <ActionIcon variant="subtle" color="gray">
                <IconEye strokeWidth={1.2} />
              </ActionIcon>
            </Group>
          </Card>
        </Anchor>
      ))}
    </SimpleGrid>
  );
};
