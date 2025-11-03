"use client";

import { t } from "@lingui/core/macro";
import { IconRestore } from "@tabler/icons-react";
import { FC } from "react";
import { useListContext } from "../list-context";
import { ActionButton } from "./action-button";

export const ResetDefaultButton: FC = () => {
  const { resetDefault } = useListContext();
  return <ActionButton icon={IconRestore} tooltip={t`Reset default`} onClick={resetDefault} />;
};
