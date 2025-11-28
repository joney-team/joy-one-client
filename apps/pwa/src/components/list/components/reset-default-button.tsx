"use client";

import { Trans } from "@lingui/react/macro";
import { IconRestore } from "@tabler/icons-react";
import { FC } from "react";
import { useListContext } from "../list-context";
import { ActionButton } from "./action-button";

export const ResetDefaultButton: FC = () => {
  const { resetDefault } = useListContext();
  return (
    <ActionButton
      icon={IconRestore}
      tooltip={<Trans>Reset default</Trans>}
      onClick={resetDefault}
    />
  );
};
