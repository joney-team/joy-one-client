import { renderLink } from "@/modules/files/files-utils";
import { t } from "@/modules/lang/lang-service";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { type FC } from "react";
import { PrinterComponentProps } from "./printer-types";

import styles from "./printer.module.css";

export const PrinterHeader: FC<PrinterComponentProps> = ({ settings }) => {
  const workspace = useWorkspace();

  return (
    <div className={styles.PrinterHeader}>
      {settings.showLogo && !!workspace.userMember.workspace.logo && (
        <img className={styles.Logo} src={renderLink(workspace.userMember.workspace.logo)} alt="" />
      )}

      <div className={styles.PrinterHeaderMetadata}>
        <div className={styles.WorkspaceName}>{workspace.userMember.workspace.name}</div>
        <div className={styles.WorkspaceInformation}>
          {!!workspace.userMember.workspace.location?.address && settings.showAddress && (
            <div>
              {t("address_short")}: {workspace.userMember.workspace.location?.address}
            </div>
          )}

          {workspace.userMember.workspace.hotline && (
            <div>
              {t("hotline")}: {workspace.userMember.workspace.hotline}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
