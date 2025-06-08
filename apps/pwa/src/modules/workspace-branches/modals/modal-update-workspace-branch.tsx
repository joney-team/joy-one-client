import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { CustomerFormEntity } from "@/modules/customer-forms/customer-form-entity";
import { updateCustomerFormWorkspaceBranch } from "@/modules/customer-forms/customer-form-service";
import { t } from "@/modules/lang/lang-service";
import { updateLoanWorkspaceBranch } from "@/modules/loans/loans-service";
import { LoanEntity } from "@/modules/loans/loans-types";
import { ReceiptEntity } from "@/modules/receipts/receipts-types";
import { WorkspaceBranchInput } from "@/modules/workspace-branches/workspace-branch-input";
import { WorkspaceBranchEntity } from "@/modules/workspace-branches/workspace-branches-types";
import { onError } from "@/utils/exceptions.utils";
import { Blockquote, Center, Modal, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBuildingSkyscraper } from "@tabler/icons-react";
import { FC, useRef, useState } from "react";

type ModalUpdateWorkspaceBranchProps = {
  workspaceBranch?: Pick<WorkspaceBranchEntity, "_id" | "name" | "hotline"> | null;
  onComplete?: () => void;
} & (
  | {
      loans: LoanEntity[];
    }
  | {
      receipts: ReceiptEntity[];
    }
  | {
      customerForms: CustomerFormEntity[];
    }
);
export let OnModalUpdateWorkspaceBranch: (props: ModalUpdateWorkspaceBranchProps) => void = () => {};

export const ModalUpdateWorkspaceBranch: FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const props = useRef<ModalUpdateWorkspaceBranchProps | null>(null);
  const [branch, setBranch] = useState<Pick<WorkspaceBranchEntity, "_id" | "name" | "hotline"> | null>(null);
  const loans = props.current && "loans" in props.current ? props.current.loans : null;
  const receipts = props.current && "receipts" in props.current ? props.current.receipts : null;
  const customerForms = props.current && "customerForms" in props.current ? props.current.customerForms : null;

  OnModalUpdateWorkspaceBranch = (p) => {
    props.current = p;
    setBranch(p.workspaceBranch || null);
    open();
  };

  const onSubmit = async () => {
    try {
      if (loans) {
        await updateLoanWorkspaceBranch({
          loanIds: loans.map((l) => l.id),
          workspaceBranchId: branch?._id || null,
        });
      }

      if (customerForms) {
        await updateCustomerFormWorkspaceBranch({
          ids: customerForms.map((c) => c._id),
          workspaceBranchId: branch?._id || null,
        });
      }

      if (receipts) {
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
      title={<ModalTitle title="move_workspace_branch" icon={IconBuildingSkyscraper} />}
    >
      <Stack align="stretch">
        {(function () {
          if (loans)
            return (
              <Blockquote variant="light" color="orange" p={16}>
                {t("update_workspace_branch_description_loans")}
              </Blockquote>
            );
        })()}

        <WorkspaceBranchInput value={branch} onChange={(v) => setBranch(v)} />

        <Center>
          <Button action onClick={onSubmit}>
            {t("confirm")}
          </Button>
        </Center>
      </Stack>
    </Modal>
  );
};
