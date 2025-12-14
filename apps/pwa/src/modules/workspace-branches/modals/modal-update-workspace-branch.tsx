"use client";

import { Button } from "@/components/buttons/button";
import { ModalHead } from "@/components/modal/modal-head";
import { api } from "@/modules/apis";
import { WorkspaceBranchInput } from "@/modules/workspace-branches/workspace-branch-input";
import { WorkspaceBranchEntity } from "@/modules/workspace-branches/workspace-branches-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { AppEntity } from "@/types";
import { onError } from "@/utils/exceptions.utils";
import { Trans } from "@lingui/react/macro";
import { Blockquote, Center, Modal, Stack } from "@mantine/core";
import { IconBuildingSkyscraper } from "@tabler/icons-react";
import { forwardRef, Fragment, ReactNode, useImperativeHandle, useState } from "react";

export interface ModalUpdateWorkspaceBranchRef {
  open: (p: ModalUpdateWorkspaceBranchProps) => void;
  close: () => void;
}

type ModalUpdateWorkspaceBranchProps = {
  entity?: AppEntity;
  ids?: string[];
  workspaceBranch?: Pick<WorkspaceBranchEntity, "_id" | "name" | "hotline"> | null;
  onComplete?: () => void;
};

export const permissionRequireds: Partial<{
  [key in AppEntity]: WorkspacePermission;
}> = {
  [AppEntity.CUSTOMERS]: WorkspacePermission.CUSTOMERS_UPDATE_INFO,
  [AppEntity.LOANS]: WorkspacePermission.LOANS_UPDATE_WORKSPACE_BRANCH,
  [AppEntity.CUSTOMER_FORMS]: WorkspacePermission.CUSTOMER_FORMS_MANAGER,
};

export const ModalUpdateWorkspaceBranch = forwardRef<
  ModalUpdateWorkspaceBranchRef,
  { children?: (ref: ModalUpdateWorkspaceBranchRef) => ReactNode }
>(({ children }, ref) => {
  const [args, setArgs] = useState<ModalUpdateWorkspaceBranchProps | null>(null);
  const [branch, setBranch] = useState<Pick<
    WorkspaceBranchEntity,
    "_id" | "name" | "hotline"
  > | null>(null);

  const entity = args?.entity;
  const ids = args?.ids ?? [];

  const onSubmit = async () => {
    try {
      if (entity === AppEntity.LOANS) {
        await api.post(`/loans/bulk-update-workspace-branch`, {
          ids,
          workspaceBranchId: branch?._id || null,
        });
      }

      if (entity === AppEntity.CUSTOMER_FORMS) {
        await api.post(`/customer-forms/bulk-update-workspace-branch`, {
          ids,
          workspaceBranchId: branch?._id || null,
        });
      }

      if (entity === AppEntity.CUSTOMERS) {
        await api.post(`/customers/bulk-update-workspace-branch`, {
          ids,
          workspaceBranchId: branch?._id || null,
        });
      }

      if (entity === AppEntity.RECEIPTS) {
        throw new Error("Not implemented");
      }

      setArgs(null);
      args?.onComplete?.();
    } catch (error) {
      onError(error);
    }
  };

  useImperativeHandle(ref, () => ({
    open: (p) => {
      setArgs(p ?? {});
      setBranch(p?.workspaceBranch ?? null);
    },
    close: () => {
      setArgs(null);
    },
  }));

  return (
    <Fragment>
      {typeof children === "function"
        ? children({
            open: (p) => {
              setBranch(p.workspaceBranch || null);
              setArgs(p);
            },
            close: () => {
              setArgs(null);
            },
          })
        : null}

      <Modal
        opened={!!args}
        onClose={() => setArgs(null)}
        title={
          <ModalHead name={<Trans>Move workspace branch</Trans>} icon={IconBuildingSkyscraper} />
        }
      >
        <Stack align="stretch">
          {entity === AppEntity.LOANS && (
            <Blockquote variant="light" color="orange" p={16} py={8} fz={14}>
              <Trans>All receipts of the payment plans will also be moved to the new branch</Trans>
            </Blockquote>
          )}

          <Blockquote variant="light" color="gray" p={16} py={8} fz={14}>
            <Trans>Leave blank to use main office</Trans>
          </Blockquote>

          <WorkspaceBranchInput value={branch} onChange={(v) => setBranch(v)} />

          <Center>
            <Button onClick={() => onSubmit()}>
              <Trans>Confirm</Trans>
            </Button>
          </Center>
        </Stack>
      </Modal>
    </Fragment>
  );
});
