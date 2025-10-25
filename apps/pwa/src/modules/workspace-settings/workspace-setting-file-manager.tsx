"use client";

import { Clickable } from "@/components/clickable";
import { List } from "@/components/list";
import { DateTimeColumn } from "@/components/list/columns/date-time-column";
import { EnumColumn } from "@/components/list/columns/enum-column";
import { formatBytes } from "@joy-one-client/utils/files";
import { ActionIcon, Image, Stack } from "@mantine/core";
import { IconFile } from "@tabler/icons-react";
import { type FC } from "react";
import { FileEntity, FileType } from "../files/file-types";
import { fileTypes } from "../files/files-constants";
import { OnModalFileGallery } from "../files/modals/modal-file-gallery";

export const WorkspaceFileManager: FC = () => {
  return (
    <Stack p={16}>
      <List<FileEntity>
        columns={{
          url: {
            name: "Preview",
            w: 100,
            align: "center",
            render: ({ data }) => {
              const onClick = () => {
                OnModalFileGallery({
                  readonly: true,
                  files: [data],
                });
              };

              if (data.type === FileType.PHOTO) {
                return <Image className="clickable" w={50} src={data.url} onClick={onClick} />;
              }

              return (
                <ActionIcon onClick={onClick}>
                  <IconFile />
                </ActionIcon>
              );
            },
          },
          createdAt: DateTimeColumn({ name: "createdAt", sortable: true, isHasFilter: true }),
          fileName: {
            render: ({ value, data }) => {
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
          type: EnumColumn<FileType>({
            w: 160,
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
