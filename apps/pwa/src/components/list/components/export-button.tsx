"use client";

import { Button } from "@/components/buttons/button";
import { ModalHead } from "@/components/modal/modal-head";
import { api } from "@/modules/apis";
import { renderFileUrl } from "@/modules/files/files-utils";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { ResponseList } from "@/types";
import { onActionLoad } from "@/utils/actions";
import { Currency } from "@joy-one-client/utils/currency";
import { DateTime } from "@joy-one-client/utils/date-time";
import { downloadJSON } from "@joy-one-client/utils/files";
import { Trans, useLingui } from "@lingui/react/macro";
import { Center, Modal, parseThemeColor, Select, Stack, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconDownload, IconFileExport } from "@tabler/icons-react";
import { FC, Fragment, useState } from "react";
import writeXlsxFile, { Row } from "write-excel-file";
import { useListContext } from "../list-context";
import { getColumnName, getIn, getListName, getValuePath } from "../list-utils";
import { ExportToExcelItem } from "../types";
import { ActionButton } from "./action-button";

export enum ExportType {
  EXCEL = "Excel",
  JSON = "Json",
}

export const ExportButton: FC = () => {
  const context = useListContext();
  const workspace = useWorkspace();
  const theme = useMantineTheme();
  const { t, i18n } = useLingui();

  const [opened, { open, close }] = useDisclosure(false);
  const [exportType, setExportType] = useState<ExportType>(ExportType.EXCEL);

  const renderExportItem = (item: ExportToExcelItem): Row[number] => {
    if (item.text) return { value: item.text };
    if (item.money)
      return {
        value: Currency.normalize(item.money, workspace.settings.currencyCode),
        type: Number,
        format: "#,##0",
      };
    if (item.number) return { value: item.number, type: Number, format: "#,##0" };
    if (item.date) return { value: DateTime.format(item.date, { locale: i18n.locale }) };
    if (item.imageUrl) return { value: renderFileUrl(item.imageUrl) };
    return { value: "" };
  };

  const onExport = async () => {
    close();

    onActionLoad({
      name: <Trans>Export data</Trans>,
      process: async () => {
        const { data } = await api.get<ResponseList<any>>(context.route, {
          params: { ...context.list.params, getAll: true },
        });

        if (data.length === 0) throw new Error(t`No data to export`);

        const time = DateTime.format(new Date(), {
          locale: i18n.locale,
          month: "2-digit",
          year: "numeric",
          day: "2-digit",
        })
          .replace(/:/g, "-")
          .replace(/\//g, "-");

        const filename = `[${workspace.userMember.workspace.code}] ${getListName()} ${time}`;

        if (exportType === ExportType.JSON) {
          return downloadJSON(data, `${filename}.json`);
        }

        if (exportType === ExportType.EXCEL) {
          const headers: (Row[number] & {})[] = [];

          for (const column of context.columns) {
            if (column.exportToExcel === false) continue;

            if (column.exportToExcel) {
              const columnExport = column.exportToExcel(data[0][column.columnKey], data[0]);
              if (Array.isArray(columnExport)) {
                columnExport.forEach((item) => {
                  headers.push({ value: item.col });
                });
              } else {
                headers.push({ value: getColumnName(column.columnKey) });
              }
              continue;
            }

            // Automation
            headers.push({ value: getColumnName(column.columnKey) });
          }

          const rows: Row[] = await Promise.all(
            data.map(async (item: any) => {
              const cols = new Array(headers.length).fill(null) as Row;

              for (const column of context.columns) {
                if (column.exportToExcel === false) continue;

                const cellValue = getIn(item, getValuePath(column.columnKey, column));

                if (column.exportToExcel) {
                  const columnExport = await column.exportToExcel(cellValue, item);
                  if (Array.isArray(columnExport)) {
                    columnExport.forEach((item) => {
                      if (item.col) {
                        const indexOfCol = headers.findIndex((v) => v?.value === item.col);
                        if (indexOfCol !== -1) {
                          cols[indexOfCol] = renderExportItem(item);
                        }
                      }
                    });
                  } else {
                    const indexOfCol = headers.findIndex(
                      (v) => v?.value === getColumnName(column.columnKey)
                    );
                    cols[indexOfCol] = renderExportItem(columnExport);
                  }

                  continue;
                }

                // Automation
                const indexOfCol = headers.findIndex(
                  (v) => v?.value === getColumnName(column.columnKey)
                );
                cols[indexOfCol] = { value: cellValue };
              }

              return cols;
            })
          );

          const primaryColor = parseThemeColor({
            color: workspace.userMember.workspace.appColor || "primary",
            theme,
          }).value;

          const borderColor = parseThemeColor({ color: "dark", theme }).value;

          const buffer = await writeXlsxFile(
            [
              headers.map((v) => ({
                ...v,
                color: "#ffffff",
                backgroundColor: primaryColor,
                borderColor: borderColor,
              })),
              ...rows,
            ],
            {
              stickyRowsCount: 1,
              fontSize: 16,
              columns: headers.map((v, i) => {
                const width = rows.reduce((acc, row) => {
                  const value = row[i];
                  return Math.max(
                    Math.max(acc, (value?.value?.toString()?.length || 0) + 2),
                    v.value?.toString()?.length || 0
                  );
                }, 0);

                return { width };
              }),
            }
          );

          const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${filename}.xlsx`;

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      },
    });
  };

  if (!workspace.hasPermission(WorkspacePermission.EXPORT_DATA)) return null;

  return (
    <Fragment>
      <ActionButton icon={IconFileExport} tooltip={<Trans>Export data</Trans>} onClick={open} />

      <Modal
        opened={opened}
        onClose={close}
        title={<ModalHead name={t`Export data`} icon={IconFileExport} />}
      >
        <Stack>
          <Select
            label={<Trans>File type</Trans>}
            value={exportType}
            onChange={(value) => setExportType(value as ExportType)}
            data={[
              { value: ExportType.EXCEL, label: ExportType.EXCEL },
              { value: ExportType.JSON, label: ExportType.JSON },
            ]}
          />

          <Center>
            <Button leftIcon={IconDownload} onClick={onExport} label={<Trans>Export</Trans>} />
          </Center>
        </Stack>
      </Modal>
    </Fragment>
  );
};
