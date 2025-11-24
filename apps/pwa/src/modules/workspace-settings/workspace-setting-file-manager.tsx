"use client";

import { Clickable } from "@/components/clickable";
import { List } from "@/components/list";
import { dateTimeColumn } from "@/components/list/columns/date-time-column";
import { enumColumn } from "@/components/list/columns/enum-column";
import { formatBytes } from "@joy-one-client/utils/files";
import { ActionIcon, Image, Stack } from "@mantine/core";
import { IconFile } from "@tabler/icons-react";
import { type FC } from "react";
import { FileEntity } from "../files/file-types";
import { fileTypes } from "../files/files-constants";
import { OnModalFileGallery } from "../files/modals/modal-file-gallery";
import { FileType } from "@/graphql/enums.graphql";

export const WorkspaceFileManager: FC = () => {
  return (
    <Stack p={16}>
      <List<FileEntity>
        columns={{
          url: {
            name: "Preview",
            defaultWidth: 100,
            align: "center",
            render: ({ data }) => {
              const onClick = () => {
                OnModalFileGallery({
                  readonly: true,
                  files: [data],
                });
              };

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
          createdAt: dateTimeColumn({ name: "createdAt", sortable: true, isHasFilter: true }),
          fileName: {
            render: ({ value, data }) => {
              if (!value) return null;

              return (
                <Clickable
                  c="var(--mantine-color-text)"
                  onClick={() =>
                    OnModalFileGallery({
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
            defaultWidth: 160,
            options: Object.values(FileType).map((type) => ({
              icon: fileTypes[type].icon,
              label: fileTypes[type].label(),
              value: type,
            })),
          }),
          size: {
            sortable: true,
            render: ({ value }) => {
              return formatBytes(value ?? 0);
            },
          },
        }}
        id="fs"
        route="/files"
      />
    </Stack>
  );
};
