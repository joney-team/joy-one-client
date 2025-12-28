import QUERY_WORKSPACE_MEMBER, {
  type WorkspaceMemberQuery,
  type WorkspaceMemberQueryVariables,
} from "@/modules/workspace-members/graphql/queryWorkspaceMember.graphql";
import { useQuery } from "@apollo/client/react";
import { NodeViewWrapper, ReactNodeViewProps } from "@tiptap/react";
import { FC, Fragment, useRef } from "react";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/buttons/button";
import { loanStatuses } from "@/modules/loans/loans-constants";
import { type ModalUserInformationRef } from "@/modules/users/modals/modal-user-information";
import { AppEntity } from "@/types";
import { nonLoading } from "@/utils/non-loading";
import { Trans, useLingui } from "@lingui/react/macro";
import { alpha, Tooltip } from "@mantine/core";
import { IconCreditCardPay, IconStack2, IconUserSquareRounded } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MentionAttributes } from "./editor-mention-types";
import styles from "./editor-mention.module.css";
import QUERY_CUSTOMER_MENTION, {
  type CustomerMentionQuery,
  type CustomerMentionQueryVariables,
} from "./queryCustomerMention.graphql";
import QUERY_LOAN_MENTION, {
  type LoanMentionQuery,
  type LoanMentionQueryVariables,
} from "./queryLoanMention.graphql";
import QUERY_TASK_MENTION, {
  type TaskMentionQuery,
  type TaskMentionQueryVariables,
} from "./queryTaskMention.graphql";
import { getTaskStatuses, useTaskStatuses } from "@/modules/tasks/hooks/use-task-statuses";
import { useColor } from "@/modules/theme/use-color";

const ModalUserInformation = dynamic(
  () =>
    import("@/modules/users/modals/modal-user-information").then((mod) => mod.ModalUserInformation),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const UserMention: FC<{ userId: string }> = ({ userId }) => {
  const modalUserInformationRef = useRef<ModalUserInformationRef>(null);
  const { data } = useQuery<WorkspaceMemberQuery, WorkspaceMemberQueryVariables>(
    QUERY_WORKSPACE_MEMBER,
    {
      variables: { userId },
      fetchPolicy: "cache-first",
    }
  );

  const user = data?.workspaceMember;

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
        leftSection={<Avatar user={user} size={14} hideOnlineStatus style={{ marginRight: -4 }} />}
      >
        {user?.name}
      </Button>

      <ModalUserInformation ref={modalUserInformationRef} />
    </NodeViewWrapper>
  );
};

const LoanMention: FC<{ loanId: string }> = ({ loanId }) => {
  const color = useColor();
  const { t } = useLingui();
  const { data } = useQuery<LoanMentionQuery, LoanMentionQueryVariables>(QUERY_LOAN_MENTION, {
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
  const { data } = useQuery<CustomerMentionQuery, CustomerMentionQueryVariables>(
    QUERY_CUSTOMER_MENTION,
    {
      variables: { customerId },
      fetchPolicy: "cache-and-network",
    }
  );

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
  const { data } = useQuery<TaskMentionQuery, TaskMentionQueryVariables>(QUERY_TASK_MENTION, {
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
