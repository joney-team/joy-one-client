import { List } from "@/components/list";
import { Group, Stack } from "@mantine/core";
import { type FC } from "react";
import { FileEntity, FileType } from "../files/file-types";
import { formatBytes } from "@joy-one-client/utils/files";
import { fileTypeIcons, getFileTypeIcon } from "../files/file-service";
import { EnumColumn } from "@/components/list/columns/enum-column";
import { t } from "../lang/lang-service";
import { Clickable } from "@/components/clickable";
import { OnModalFileGallery } from "../files/modals/modal-file-gallery";

export const WorkspaceFileManager: FC = () => {
  return (
    <Stack p={16}>
      <List<FileEntity>
        columns={{
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
              icon: fileTypeIcons[type],
              label: t(`file_type_${type}`),
              value: type,
            })),
          }),
          size: {
            isSortable: true,
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
