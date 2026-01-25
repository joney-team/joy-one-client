"use client";

import { Clickable } from "@/components/clickable";
import { List } from "@/components/list";
import { dateTimeColumn } from "@/components/list/columns/date-time-column";
import { enumColumn } from "@/components/list/columns/enum-column";
import { FileType } from "@/graphql/enums.graphql";
import { formatBytes } from "@joy-one-client/utils/files";
import { ActionIcon, Image, Stack } from "@mantine/core";
import { IconFile } from "@tabler/icons-react";
import { type FC } from "react";
import { FileEntity } from "./file-types";
import { fileTypes } from "./files-constants";
import { ModalFileGallery } from "./modals/modal-file-gallery";
import { Trans } from "@lingui/react/macro";

import QUERY_FILES from "./graphql/queryFiles.graphql";

export const FilesManager: FC = () => {
  return (
    <ModalFileGallery>
      {(openGallery) => (
        <Stack p={16}>
          <List<FileEntity>
            columns={{
              url: {
                name: <Trans>Preview</Trans>,
                defaultWidth: 100,
                align: "center",
                render: ({ data }) => {
                  const onClick = () => {
                    openGallery({
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
                        openGallery({
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
                  label: fileTypes[type].label(),
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
            query={QUERY_FILES}
          />
        </Stack>
      )}
    </ModalFileGallery>
  );
};
