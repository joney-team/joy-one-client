import { useQuery } from "@apollo/client/react";
import { NodeViewWrapper, ReactNodeViewProps } from "@tiptap/react";
import { FC, Fragment, useRef } from "react";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { loanStatuses } from "@/modules/loans/loans-constants";
import { getTaskStatuses } from "@/modules/tasks/hooks/use-task-statuses";
import { useColor } from "@/modules/theme/use-color";
import { type ModalUserInformationRef } from "@/modules/users/modals/modal-user-information";
import GetWorkspaceMemberByUserIdDocument from "@/modules/workspace-members/graphql/getWorkspaceMemberByUserId.graphql";
import { AppEntity } from "@/types";
import { nonLoading } from "@/utils/non-loading";
import { Trans, useLingui } from "@lingui/react/macro";
import { alpha, Tooltip } from "@mantine/core";
import { IconCreditCardPay, IconStack2, IconUserSquareRounded } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MentionAttributes } from "./editor-mention-types";
import styles from "./editor-mention.module.css";
import GetCustomerMentionDocument from "./getCustomerMention.graphql";
import GetLoanMentionDocument from "./getLoanMention.graphql";
import GetTaskMentionDocument from "./getTaskMention.graphql";

const ModalUserInformation = dynamic(
  () =>
    import("@/modules/users/modals/modal-user-information").then((mod) => mod.ModalUserInformation),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const UserMention: FC<{ userId: string }> = ({ userId }) => {
  const modalUserInformationRef = useRef<ModalUserInformationRef>(null);
  const { data } = useQuery(GetWorkspaceMemberByUserIdDocument, {
    variables: { userId },
  });

  const member = data?.member;

  return (
    <NodeViewWrapper as="span" key={userId}>
      <Button
        size="compact-xs"
        onClick={() => modalUserInformationRef.current?.open(userId)}
        variant="light"
        color={"gray"}
        bg="gray.1"
        c="dark"
        pr={6}
        radius={15}
        leftSection={
          <Avatar user={member} size={14} hideOnlineStatus style={{ marginRight: -4 }} />
        }
      >
        {member?.name}
      </Button>

      <ModalUserInformation ref={modalUserInformationRef} />
    </NodeViewWrapper>
  );
};

const LoanMention: FC<{ loanId: string }> = ({ loanId }) => {
  const color = useColor();
  const { t } = useLingui();
  const { data } = useQuery(GetLoanMentionDocument, {
    variables: { loanId },
    fetchPolicy: "cache-and-network",
  });

  const loan = data?.loan;

  const loanStatus = loan ? loanStatuses[loan?.status] : null;

  return (
    <NodeViewWrapper as="span" key={loanId} className={styles.LoanMention}>
      <Tooltip
        label={
          <Fragment>
            <Trans>Loan</Trans>
            {": "} {loanStatus ? t(loanStatus?.label) : undefined}
          </Fragment>
        }
        disabled={!loanStatus}
      >
        <Button
          size="compact-xs"
          component={Link}
          href={`/loans/${data?.loan.code}`}
          color={loanStatus?.color}
          variant="outline"
          leftSection={
            <IconCreditCardPay size={16} strokeWidth={1.6} style={{ marginRight: -4 }} />
          }
          radius={3}
          pr={6}
          style={loanStatus ? { borderColor: alpha(color(loanStatus.color ?? "gray"), 0.3) } : {}}
        >
          {loan?.code}
          {" - "}
          {loan?.customer.name.trim()}
        </Button>
      </Tooltip>
    </NodeViewWrapper>
  );
};

const CustomerMention: FC<{ customerId: string }> = ({ customerId }) => {
  const { data } = useQuery(GetCustomerMentionDocument, {
    variables: { customerId },
    fetchPolicy: "cache-and-network",
  });

  const customer = data?.customer;

  return (
    <NodeViewWrapper as="span" key={customerId} className={styles.CustomerMention}>
      <Tooltip label={<Trans>Customer</Trans>}>
        <Button
          size="compact-xs"
          component={Link}
          href={`/customers/${data?.customer.code}`}
          variant="light"
          leftIcon={IconUserSquareRounded}
          pr={6}
          pl={6}
          radius={15}
        >
          {customer?.name}
        </Button>
      </Tooltip>
    </NodeViewWrapper>
  );
};

const TaskMention: FC<{ taskId: string }> = ({ taskId }) => {
  const color = useColor();
  const { data } = useQuery(GetTaskMentionDocument, {
    variables: { id: taskId },
    fetchPolicy: "cache-and-network",
  });

  const task = data?.task;

  const { status } = task ? getTaskStatuses(task) : { status: null };

  return (
    <NodeViewWrapper as="span" key={taskId} className={styles.TaskMention}>
      <Tooltip
        label={
          <Fragment>
            <Trans>Task</Trans>
            {": "} {task?.name}
          </Fragment>
        }
        disabled={!task?.name}
      >
        <Button
          size="compact-xs"
          component={Link}
          href={`/tasks/${data?.task.code}`}
          variant="outline"
          leftSection={<IconStack2 size={16} strokeWidth={1.6} style={{ marginRight: -4 }} />}
          color={color(status?.color ?? "gray")}
          radius={3}
          pr={6}
          style={{ borderColor: alpha(color(status?.color ?? "gray"), 0.3) }}
        >
          {task?.code}
          {" - "}
          {task?.name}
        </Button>
      </Tooltip>
    </NodeViewWrapper>
  );
};

export const MentionNodeView: FC<ReactNodeViewProps> = ({ node }) => {
  const { id, entity } = (node.attrs ?? {}) as MentionAttributes;

  if (id && entity === AppEntity.USERS) {
    return <UserMention userId={id} />;
  }

  if (id && entity === AppEntity.LOANS) {
    return <LoanMention loanId={id} />;
  }

  if (id && entity === AppEntity.CUSTOMERS) {
    return <CustomerMention customerId={id} />;
  }

  if (id && entity === AppEntity.TASKS) {
    return <TaskMention taskId={id} />;
  }

  return (
    <NodeViewWrapper as="span" key={id} className={styles.UnknownMention}>
      <Trans>Unknown data</Trans>
    </NodeViewWrapper>
  );
};
