import { t } from "@/modules/lang/lang-service";
import { ActionIcon, Anchor, Card, Group, SimpleGrid, Text } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import Link from "next/link";
import { FC } from "react";

export const WorkspaceTermsAndPolicies: FC = () => {
  const docs = ["terms-of-service", "privacy-policy"];

  return (
    <SimpleGrid cols={{ md: 2 }}>
      {docs.map((doc) => (
        <Anchor key={doc} component={Link} href={`/docs/${doc}`}>
          <Card withBorder shadow="none">
            <Group justify="space-between">
              <Text>{t(doc)}</Text>

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
