"use client";

import { Avatar } from "@/components/avatar";
import { Errored } from "@/components/errored";
import { useLayout } from "@/layout/layout-context";
import { EventType } from "@/modules/events/event-types";
import { onUploadWorkspaceFile, removeFileFromRelativePath } from "@/modules/files/file-service";
import { OnModalParnterForm } from "@/modules/partners/modals/modal-partner-form";
import { getPartner, updatePartner } from "@/modules/partners/partners-service";
import { PartnerEntity } from "@/modules/partners/partners-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { onError } from "@/utils/exceptions.utils";
import { useFetch } from "@/utils/use-fetch.util";
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

export const PartnerDetail: FC = () => {
  const params = useParams();
  const partnerId = params.id as string;
  const workspace = useWorkspace();
  const layout = useLayout();

  const data = useFetch<PartnerEntity>({
    id: `partners-${partnerId}`,
    fetch: async () => getPartner(partnerId as string),
    refetchEvents: {
      types: [EventType.PARTNER_UPDATED, EventType.PARTNER_ARCHIVED],
      condition: (e, _partner) => e.ref === _partner._id,
    },
  });

  useEffect(() => {
    layout.setComponents({
      navigation: data.data && (
        <Fragment>
          <Anchor href={`tel:${data.data.phone}`}>
            <Button leftSection={<IconPhone size={18} strokeWidth={1.5} />}>Gọi ngay</Button>
          </Anchor>

          {data.data.email && (
            <Anchor href={`mailto:${data.data.email}`}>
              <Button leftSection={<IconMail size={18} strokeWidth={1.5} />} variant="outline">
                Gửi mail
              </Button>
            </Anchor>
          )}
        </Fragment>
      ),
    });
  }, [data.data]);

  const uploadLogo = async (file: File) => {
    try {
      const _currentAvatar = partner.logo;
      const _file = await onUploadWorkspaceFile({ file, compressSize: 1 });
      await updatePartner(partner._id, { ...partner, logo: _file.relativePath });
      if (_currentAvatar) await removeFileFromRelativePath(_currentAvatar).catch(onError);
    } catch (error) {
      onError(error);
    }
  };

  if (data.isFetching)
    return (
      <Stack p={16}>
        <Skeleton height={150} />
      </Stack>
    );

  if (data.error || !data.data) return <Errored error={data.error} />;
  const { data: partner } = data;

  return (
    <Stack p={16}>
      <Card shadow="xs" p={10}>
        <Group align="start" wrap="nowrap" justify="space-between">
          <Stack gap={16}>
            <Group wrap="nowrap" align="start" gap={16}>
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
            <Group justify="flex-end">
              <ActionIcon
                variant="transparent"
                color="gray"
                onClick={() => OnModalParnterForm({ partner })}
                style={{ marginRight: -5, marginTop: -3 }}
              >
                <IconPencil size={22} strokeWidth={1.5} />
              </ActionIcon>
            </Group>
          )}
        </Group>
      </Card>
    </Stack>
  );
};
