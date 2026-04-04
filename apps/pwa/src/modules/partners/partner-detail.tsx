"use client";

import { Avatar } from "@/components/avatar";
import { Errored } from "@/components/errored";
import { EventType } from "@/graphql/enums.graphql";
import { useLayout } from "@/layout/layout-context";
import { ModalParnterForm } from "@/modules/partners/modals/modal-partner-form";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onError } from "@/utils/exceptions.utils";
import { useApolloClient, useQuery } from "@apollo/client/react";
import { Trans } from "@lingui/react/macro";
import {
  ActionIcon,
  Anchor,
  Button,
  Card,
  Group,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { IconMail, IconPencil, IconPhone, IconUpload } from "@tabler/icons-react";
import { useParams } from "next/navigation";
import { FC, Fragment, useEffect } from "react";
import { useEventsListener } from "../events/event-service";
import { useUploadFile } from "../files/hooks/use-upload-file";
import GetPartnerDocument from "./graphql/getPartner.graphql";
import UpdatePartnerDocument from "./graphql/updatePartner.graphql";

export const PartnerDetail: FC = () => {
  const client = useApolloClient();
  const params = useParams<{ id: string }>();
  const workspace = useWorkspace();
  const layout = useLayout();
  const uploadFile = useUploadFile();

  const { data, loading, error, refetch } = useQuery(GetPartnerDocument, {
    variables: {
      partnerId: params.id,
    },
    skip: !params.id,
  });

  useEventsListener([EventType.PartnerUpdated, EventType.PartnerArchived], (event) => {
    if (event.ref === params.id) {
      refetch();
    }
  });

  const partner = data ? data.getPartner : null;

  useEffect(() => {
    layout.setComponents({
      navigation: partner && (
        <Fragment>
          <Anchor href={`tel:${partner.phone}`}>
            <Button leftSection={<IconPhone size={18} strokeWidth={1.5} />}>
              <Trans>Call now</Trans>
            </Button>
          </Anchor>

          {partner.email && (
            <Anchor href={`mailto:${partner.email}`}>
              <Button leftSection={<IconMail size={18} strokeWidth={1.5} />} variant="outline">
                <Trans>Send email</Trans>
              </Button>
            </Anchor>
          )}
        </Fragment>
      ),
    });
  }, [partner]);

  const uploadLogo = async (file: File) => {
    try {
      if (!partner) return;

      const uploadedFile = await uploadFile(file, { compressSize: 1 });
      client.mutate({
        mutation: UpdatePartnerDocument,
        variables: {
          partnerId: params.id,
          input: {
            name: partner?.name,
            phone: partner?.phone,
            email: partner?.email,
            logo: uploadedFile.path,
          },
        },
      });
    } catch (error) {
      onError(error);
    }
  };

  if (loading && !data)
    return (
      <Stack p="md">
        <Skeleton height={150} />
      </Stack>
    );

  if (error || !partner) return <Errored error={error} />;

  return (
    <Stack p="md">
      <Card shadow="xs" p={10}>
        <Group align="start" wrap="nowrap" justify="space-between">
          <Stack gap="md">
            <Group wrap="nowrap" align="start" gap="md">
              <Dropzone accept={IMAGE_MIME_TYPE} onDrop={(files) => uploadLogo(files[0])}>
                <Stack style={{ cursor: "pointer", position: "relative" }} gap={2}>
                  <Avatar partner={partner} size={65} radius={8} />

                  {!partner.logo && (
                    <Stack
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "100%",
                        height: "100%",
                        borderRadius: 8,
                      }}
                      justify="center"
                      align="center"
                      bg="gray.1"
                      gap={0}
                    >
                      <ThemeIcon size="xs" variant="transparent" color="gray">
                        <IconUpload strokeWidth={1.5} size={12} />
                      </ThemeIcon>
                      <Text c="gray" fw={500} fz={8}>
                        Upload
                      </Text>
                    </Stack>
                  )}
                </Stack>
              </Dropzone>

              <Stack gap={3}>
                <Text fw={500}>{partner.name}</Text>

                <Group>
                  {partner.phone && (
                    <Anchor
                      href={`tel:${partner.phone}`}
                      c="dark"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Group gap={1}>
                        <ThemeIcon color="dark" variant="transparent">
                          <IconPhone strokeWidth={1.5} size={18} />
                        </ThemeIcon>
                        <Text fz={16}>{partner.phone}</Text>
                      </Group>
                    </Anchor>
                  )}

                  {partner.email && (
                    <Anchor
                      href={`mailto:${partner.email}`}
                      c="dark"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Group gap={1}>
                        <ThemeIcon color="dark" variant="transparent">
                          <IconMail strokeWidth={1.5} size={18} />
                        </ThemeIcon>
                        <Text fz={16}>{partner.email}</Text>
                      </Group>
                    </Anchor>
                  )}
                </Group>
              </Stack>
            </Group>
          </Stack>

          {workspace.hasPermission(WorkspacePermission.PARTNERS_WRITE) && (
            <ModalParnterForm>
              {(open) => (
                <Group justify="flex-end">
                  <ActionIcon
                    variant="transparent"
                    color="gray"
                    onClick={() => open({ partner })}
                    style={{ marginRight: -5, marginTop: -3 }}
                  >
                    <IconPencil size={22} strokeWidth={1.5} />
                  </ActionIcon>
                </Group>
              )}
            </ModalParnterForm>
          )}
        </Group>
      </Card>
    </Stack>
  );
};
