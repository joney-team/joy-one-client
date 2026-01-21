"use client";

import { renderFileUrl } from "@/modules/files/files-utils";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { type FC } from "react";
import { PrinterComponentProps } from "./printer-types";

import { useLingui } from "@lingui/react/macro";
import styles from "./printer.module.css";

export const PrinterHeader: FC<PrinterComponentProps> = ({ settings }) => {
  const workspace = useWorkspace();
  const { t } = useLingui();

  return (
    <div className={styles.PrinterHeader}>
      {settings.showLogo && !!workspace.member.workspace.logo && (
        <img className={styles.Logo} src={renderFileUrl(workspace.member.workspace.logo)} alt="" />
      )}

      <div className={styles.PrinterHeaderMetadata}>
        <div className={styles.WorkspaceName}>{workspace.member.workspace.name}</div>
        <div className={styles.WorkspaceInformation}>
          {!!workspace.member.workspace.location?.address && settings.showAddress && (
            <div>
              {t`ADD`}: {workspace.member.workspace.location?.address}
            </div>
          )}

          {workspace.member.workspace.hotline && (
            <div>
              {t`Hotline`}: {workspace.member.workspace.hotline}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
