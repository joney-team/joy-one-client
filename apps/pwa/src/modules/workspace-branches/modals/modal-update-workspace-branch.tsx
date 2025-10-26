import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { api } from "@/modules/apis";
import { WorkspaceBranchInput } from "@/modules/workspace-branches/workspace-branch-input";
import { WorkspaceBranchEntity } from "@/modules/workspace-branches/workspace-branches-types";
import { WorkspacePermission } from "@/modules/workspace-roles/workspace-roles-types";
import { AppEntity } from "@/types";
import { onError } from "@/utils/exceptions.utils";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Blockquote, Center, Modal, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBuildingSkyscraper } from "@tabler/icons-react";
import { FC, useRef, useState } from "react";

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

export let OnModalUpdateWorkspaceBranch: (
  props: ModalUpdateWorkspaceBranchProps
) => void = () => {};

export const ModalUpdateWorkspaceBranch: FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const props = useRef<ModalUpdateWorkspaceBranchProps | null>(null);
  const [branch, setBranch] = useState<Pick<
    WorkspaceBranchEntity,
    "_id" | "name" | "hotline"
  > | null>(null);

  OnModalUpdateWorkspaceBranch = (p) => {
    props.current = p;
    setBranch(p.workspaceBranch || null);
    open();
  };

  const entity = props.current?.entity;
  const ids = props.current?.ids ?? [];

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

      close();
      props.current?.onComplete?.();
    } catch (error) {
      onError(error);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={<ModalTitle title={t`Move workspace branch`} icon={IconBuildingSkyscraper} />}
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
          <Button action onClick={onSubmit}>
            <Trans>Confirm</Trans>
          </Button>
        </Center>
      </Stack>
    </Modal>
  );
};
