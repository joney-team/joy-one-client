"use client";

import { onConfirmModal } from "@/hooks/use-confirm-modal";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { IconRestore } from "@tabler/icons-react";
import { FC } from "react";
import { useListContext } from "../list-context";
import { ActionButton } from "./action-button";

export const ResetDefaultButton: FC = () => {
  const props = useListContext();

  const onResetDefault = () => {
    onConfirmModal({
      title: <Trans>Reset default</Trans>,
      content: <Trans>All settings will be restored to default.</Trans>,
      onConfirm: props.resetDefault,
      confirmLabel: <Trans>Reset</Trans>,
      cancelLabel: <Trans>Keep</Trans>,
    });
  };

  return <ActionButton icon={IconRestore} tooltip={t`Reset default`} onClick={onResetDefault} />;
};
