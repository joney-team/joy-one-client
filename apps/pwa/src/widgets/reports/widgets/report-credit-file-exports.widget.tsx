"use client";

import { Button } from "@/components/buttons/button";
import { DateFormat } from "@/components/format/date-format";
import { SectionTitle } from "@/components/session-title";
import { EventType, FileExportContextType, FileExportStatus } from "@/graphql/enums.graphql";
import { onConfirmModal } from "@/hooks/use-confirm-modal";
import { useEventsListener } from "@/modules/events/event-service";
import CreateFileExportDocument from "@/modules/file-exports/graphql/createFileExport.graphql";
import DeleteFileExportDocument from "@/modules/file-exports/graphql/deleteFileExport.graphql";
import { FileExportFragment } from "@/modules/file-exports/graphql/fragmentFileExport.graphql";
import GetFileExportsDocument from "@/modules/file-exports/graphql/getFileExports.graphql";
import RetryFileExportDocument from "@/modules/file-exports/graphql/retryFileExport.graphql";
import { getClientLocale } from "@/modules/lang/lang-service";
import { onError } from "@/utils/exceptions.utils";
import { String } from "@/utils/string.utils";
import { WidgetProps } from "@/widgets/widgets-types";
import { useMutation, useQuery } from "@apollo/client/react";
import { DateTime } from "@joy-one-client/utils/date-time";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  ActionIcon,
  Badge,
  Card,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconCloudDownload, IconFileExport, IconRefresh, IconTrash } from "@tabler/icons-react";
import { FC, useState } from "react";
import { ReportWidgetsContext } from "../types";

const statusColors: Record<FileExportStatus, string> = {
  [FileExportStatus.Idle]: "gray",
  [FileExportStatus.Processing]: "blue",
  [FileExportStatus.Finished]: "green",
  [FileExportStatus.Failed]: "red",
};

const StatusBadge: FC<{ status: FileExportStatus }> = ({ status }) => {
  const { t } = useLingui();

  const labels: Record<FileExportStatus, string> = {
    [FileExportStatus.Idle]: t`Pending`,
    [FileExportStatus.Processing]: t`Processing`,
    [FileExportStatus.Finished]: t`Finished`,
    [FileExportStatus.Failed]: t`Failed`,
  };

  return (
    <Badge color={statusColors[status]} variant="light" size="sm">
      {labels[status]}
    </Badge>
  );
};

const downloadExport = async (exportId: string, fileName?: string | null) => {
  const response = await fetch(`/api/file-exports/${exportId}/download`);
  if (!response.ok) throw new Error("Download failed");

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName || `credit-report-${exportId}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const ReportCreditFileExportsWidget: FC<WidgetProps<ReportWidgetsContext>> = (props) => {
  const { t } = useLingui();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery(GetFileExportsDocument, {
    variables: {
      query: { contextType: FileExportContextType.CreditReport },
    },
    fetchPolicy: "cache-and-network",
  });

  const exports: FileExportFragment[] = data?.list.results ?? [];

  useEventsListener(
    [EventType.FileExportNew, EventType.FileExportFinished, EventType.FileExportFailed],
    () => refetch(),
    [],
  );

  const [createFileExport, { loading: isCreating }] = useMutation(CreateFileExportDocument);
  const [retryFileExport] = useMutation(RetryFileExportDocument);
  const [deleteFileExport] = useMutation(DeleteFileExportDocument);

  const handleCreate = async () => {
    try {
      const locale = getClientLocale();
      const formatDate = (time: number) =>
        DateTime.format(time, { locale, dateStyle: "short" }).replace(/\//g, "-");

      const fileName = String.capitalizeFirstLetter(
        `${t`Reports`} ${t`Income expense`} ${t`From`} ${formatDate(props.ctx.fromTime)} ${t`To`} ${formatDate(props.ctx.toTime)}`,
      );

      await createFileExport({
        variables: {
          input: {
            contextType: FileExportContextType.CreditReport,
            fileName,
            contextArgs: {
              fromTime: props.ctx.fromTime,
              toTime: props.ctx.toTime,
              ...(props.ctx.workspaceBranchIds?.length
                ? { workspaceBranchIds: props.ctx.workspaceBranchIds }
                : {}),
            },
          },
        },
      });
      refetch();
    } catch (error) {
      onError(error);
    }
  };

  const handleRetry = async (exportId: string) => {
    try {
      await retryFileExport({ variables: { exportId } });
      refetch();
    } catch (error) {
      onError(error);
    }
  };

  const handleDelete = (exportId: string, fileName?: string | null) => {
    onConfirmModal({
      type: "danger",
      title: <Trans>Delete export</Trans>,
      content: (
        <Trans>
          Are you sure you want to delete <strong>{fileName || exportId}</strong>? This action
          cannot be undone.
        </Trans>
      ),
      icon: IconTrash,
      confirmLabel: <Trans>Delete</Trans>,
      onConfirm: async () => {
        await deleteFileExport({ variables: { exportId } });
        refetch();
      },
    });
  };

  return (
    <Card withBorder={false} shadow="xs" p="md" w="100%" h="100%">
      <Stack h="100%" gap="sm">
        <SectionTitle name={<Trans>Export credit report</Trans>} icon={IconFileExport}>
          <Group justify="end" flex={1}>
            <Button
              size="compact-sm"
              leftIcon={IconFileExport}
              onClick={handleCreate}
              loading={isCreating}
              fz={12}
            >
              <Trans>Request export</Trans>
            </Button>
          </Group>
        </SectionTitle>

        {loading && exports.length === 0 ? (
          <Group justify="center" py="md">
            <Loader size="sm" />
          </Group>
        ) : exports.length === 0 ? (
          <Text c="dimmed" size="sm" ta="center" py="md">
            <Trans>No exports yet</Trans>
          </Text>
        ) : (
          <ScrollArea flex={1} offsetScrollbars>
            <Stack gap={6}>
              {exports.map((item) => (
                <Card key={item._id} withBorder shadow="none" p="xs">
                  <Group justify="space-between" wrap="nowrap" gap="xs">
                    <Stack gap={2} style={{ minWidth: 0 }}>
                      <Text size="sm" truncate>
                        {item.fileName || <Trans>Credit report</Trans>}
                      </Text>
                      {item.createdAt && (
                        <Text size="xs" c="dimmed">
                          <DateFormat value={item.createdAt} />
                        </Text>
                      )}
                    </Stack>

                    <Group gap={6} wrap="nowrap">
                      <StatusBadge status={item.status as FileExportStatus} />

                      {item.status === FileExportStatus.Processing && <Loader size={14} />}

                      {item.status === FileExportStatus.Finished && (
                        <Tooltip label={t`Download`}>
                          <ActionIcon
                            variant="subtle"
                            color="green"
                            loading={downloadingId === item._id}
                            onClick={async () => {
                              try {
                                setDownloadingId(item._id);
                                await downloadExport(item._id, item.fileName);
                              } catch (error) {
                                onError(error);
                              } finally {
                                setDownloadingId(null);
                              }
                            }}
                          >
                            <IconCloudDownload size={16} />
                          </ActionIcon>
                        </Tooltip>
                      )}

                      {item.status === FileExportStatus.Failed && (
                        <Tooltip label={item.error || t`Retry`}>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => handleRetry(item._id)}
                          >
                            <IconRefresh size={16} />
                          </ActionIcon>
                        </Tooltip>
                      )}

                      <Tooltip label={t`Delete`}>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          onClick={() => handleDelete(item._id, item.fileName)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>
                </Card>
              ))}
            </Stack>
          </ScrollArea>
        )}
      </Stack>
    </Card>
  );
};
