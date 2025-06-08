import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { api } from "@/modules/apis";
import { renderLink } from "@/modules/files/files-utils";
import { getDateTimeFormat, numCurrencyRound, renderDateTime, t } from "@/modules/lang/lang-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { ResponseList } from "@joy-one-client/apis/types/general";
import { WorkspacePermission } from "@joy-one-client/apis/types/workspace-roles";
import { downloadJSON } from "@joy-one-client/utils/files";
import { Center, Modal, parseThemeColor, Select, Stack, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconDownload, IconFileExport } from "@tabler/icons-react";
import dayjs from "dayjs";
import { FC, useState } from "react";
import writeXlsxFile, { Row } from "write-excel-file";
import { ExportToExcelItem, ListContext } from "../types";
import { getIn, getValuePath } from "../utils";
import { ActionButton } from "./action-button";

export enum ExportType {
  EXCEL = "Excel",
  JSON = "Json",
}

export const ExportButton: FC<ListContext> = (props) => {
  const workspace = useWorkspace();
  const theme = useMantineTheme();

  const [opened, { open, close }] = useDisclosure(false);
  const [exportType, setExportType] = useState<ExportType>(ExportType.EXCEL);

  const renderExportItem = (item: ExportToExcelItem): Row[number] => {
    if (item.text) return { value: item.text };
    if (item.money)
      return {
        value: numCurrencyRound(item.money),
        type: Number,
        format: "#,##0",
      };
    if (item.number) return { value: item.number, type: Number, format: "#,##0" };
    if (item.date) return { value: renderDateTime(item.date) };
    if (item.imageUrl) return { value: renderLink(item.imageUrl) };
    return { value: "" };
  };

  const onExport = async () => {
    try {
      const queryFn =
        "fetch" in props
          ? () => props.fetch({ ...props.list.query, getAll: true }).then((res) => res.data)
          : () =>
              api
                .get<ResponseList<any>>(props.route, { params: { ...props.list.query, getAll: true } })
                .then((res) => res.data);

      const data = await queryFn();

      if (data.length === 0) throw new Error(t("NO_DATA_TO_EXPORT"));

      const filename = `[${workspace.userMember.workspace.code}] ${t(props.name || "data")} ${dayjs()
        .format(getDateTimeFormat())
        .replace(/:/g, "-")
        .replace(/\//g, "-")}`;

      if (exportType === ExportType.JSON) {
        return downloadJSON(data, `${filename}.json`);
      }

      if (exportType === ExportType.EXCEL) {
        const headers: (Row[number] & {})[] = [];

        for (const col of props.columnSettings) {
          const column = props.columns[col.id];
          if (!column) continue;
          if (column.exportToExcel === false) continue;

          if (column.exportToExcel) {
            const tempExport = column.exportToExcel(data[0][col.id], data[0]);
            if (Array.isArray(tempExport)) {
              tempExport.forEach((item) => {
                headers.push({ value: t(item.col) });
              });
            } else {
              headers.push({ value: t(column.name || col.id) });
            }
            continue;
          }

          // Automation
          headers.push({ value: t(column.name || col.id) });
        }

        const rows: Row[] = data.map((item) => {
          const cols = new Array(headers.length).fill(null) as Row;

          for (const columnSetting of props.columnSettings) {
            const column = props.columns[columnSetting.id];
            if (!column) continue;
            if (column.exportToExcel === false) continue;

            const value = getIn(item, getValuePath(columnSetting.id, column));

            if (column.exportToExcel) {
              const tempExport = column.exportToExcel(value, item);
              if (Array.isArray(tempExport)) {
                tempExport.forEach((item) => {
                  if (item.col) {
                    const indexOfCol = headers.findIndex((v) => v?.value === item.col);
                    if (indexOfCol !== -1) {
                      cols[indexOfCol] = renderExportItem(item);
                    }
                  }
                });
              } else {
                const indexOfCol = headers.findIndex((v) => v?.value === t(column.name || columnSetting.id));
                cols[indexOfCol] = renderExportItem(tempExport);
              }

              continue;
            }

            // Automation
            const indexOfCol = headers.findIndex((v) => v?.value === t(column.name || columnSetting.id));
            cols[indexOfCol] = { value };
          }

          return cols;
        });

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
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  if (!workspace.hasPermission(WorkspacePermission.EXPORT_DATA)) return null;

  return (
    <>
      <ActionButton icon={IconFileExport} tooltip="export-data" onClick={open} />

      <Modal opened={opened} onClose={close} title={<ModalTitle title="export-data" icon={IconFileExport} />}>
        <Stack>
          <Select
            label={t("export-type")}
            value={exportType}
            onChange={(value) => setExportType(value as ExportType)}
            data={[
              { value: ExportType.EXCEL, label: ExportType.EXCEL },
              { value: ExportType.JSON, label: ExportType.JSON },
            ]}
          />

          <Center mt={16}>
            <Button action leftIcon={IconDownload} onClick={onExport} label="export" />
          </Center>
        </Stack>
      </Modal>
    </>
  );
};
