"use client";

import { Clickable } from "@/components/clickable";
import { List } from "@/components/list";
import { dateTimeColumn } from "@/components/list/columns/date-time-column";
import { enumColumn } from "@/components/list/columns/enum-column";
import { FileType } from "@/graphql/enums.graphql";
import { formatBytes } from "@joy-one/utils/files";
import { Trans, useLingui } from "@lingui/react/macro";
import { ActionIcon, Image, Stack } from "@mantine/core";
import { IconFile } from "@tabler/icons-react";
import { useRef, type FC } from "react";
import { fileTypes } from "./files-constants";
import { type ModalFilesViewerRef } from "./modals/modal-files-viewer";

import { nonLoading } from "@/utils/non-loading";
import dynamic from "next/dynamic";
import { FileFragment } from "./graphql/fragmentFile.graphql";
import GetFilesDocument from "./graphql/getFiles.graphql";

const ModalFileGallery = dynamic(
  () => import("@/modules/files/modals/modal-files-viewer").then((mod) => mod.ModalFilesViewer),
  {
    ssr: false,
    loading: nonLoading,
  },
);

export const FilesManager: FC = () => {
  const modalFileGalleryRef = useRef<ModalFilesViewerRef>(null);
  const { t } = useLingui();

  return (
    <Stack p="md">
      <List<FileFragment>
        columns={{
          url: {
            name: <Trans>Preview</Trans>,
            defaultWidth: 100,
            align: "center",
            render: ({ data }) => {
              const onClick = () =>
                modalFileGalleryRef.current?.open({
                  readonly: true,
                  files: [data],
                });

              if (data.type === FileType.Photo) {
                return <Image className="clickable" w={50} src={data.url} onClick={onClick} />;
              }

              return (
                <ActionIcon onClick={onClick}>
                  <IconFile />
                </ActionIcon>
              );
            },
          },
          createdAt: dateTimeColumn({
            name: <Trans>Created at</Trans>,
            sortable: true,
            isHasFilter: true,
          }),
          fileName: {
            name: <Trans>File name</Trans>,
            render: ({ value, data }) => {
              if (!value) return null;

              return (
                <Clickable
                  c="var(--mantine-color-text)"
                  onClick={() =>
                    modalFileGalleryRef.current?.open({
                      readonly: true,
                      files: [data],
                    })
                  }
                  fz={14}
                  fw={500}
                >
                  {value}
                </Clickable>
              );
            },
          },
          type: enumColumn<FileType>({
            name: <Trans>File type</Trans>,
            defaultWidth: 160,
            options: Object.values(FileType).map((type) => ({
              icon: fileTypes[type].icon,
              label: t(fileTypes[type].label),
              value: type,
            })),
          }),
          size: {
            name: <Trans>Size</Trans>,
            sortable: true,
            render: ({ value }) => {
              return formatBytes(value ?? 0);
            },
          },
        }}
        id="fs"
        query={GetFilesDocument}
      />

      <ModalFileGallery ref={modalFileGalleryRef} />
    </Stack>
  );
};
