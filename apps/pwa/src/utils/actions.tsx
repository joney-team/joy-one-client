"use client";

import { getGlobal } from "@/global";
import { onConfirmModal } from "@/hooks/use-confirm-modal";
import { type AppMetadata } from "@/types";
import { onError } from "@/utils/exceptions.utils";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { notifications } from "@mantine/notifications";
import { Icon, IconArchive, IconCheck, ReactNode } from "@tabler/icons-react";

export function onActionLoad<T = any>(args: {
  name?: string;
  icon?: Icon;
  process: () => Promise<T>;
  color?: string;
  throwError?: boolean;
  isShowCompleted?: boolean;
  onFinished?: (result: T, notificationId: string) => Promise<any> | any;
}): Promise<T> {
  const global = getGlobal();
  const metadata = global._metadata as AppMetadata;
  const color = metadata?.appColor
    ? `${metadata.appColor}.${metadata.appColorShape || 6}`
    : args.color || "primary";
  const isShowCompleted = typeof args.isShowCompleted === "boolean" ? args.isShowCompleted : true;

  return new Promise(async (resolve, reject) => {
    const id = notifications.show({
      title: args.name || t`Processing`,
      message: t`Waiting`,
      color,
      icon: args.icon ? <args.icon strokeWidth={1.6} size={20} /> : undefined,
      autoClose: false,
      loading: true,
      styles: {
        title: { fontSize: "15px" },
        description: { fontSize: "15px" },
      },
    });

    try {
      const result = await args.process();
      if (!isShowCompleted) {
        notifications.hide(id);
      } else {
        notifications.update({
          id,
          color,
          icon: <IconCheck strokeWidth={1.5} size={18} />,
          message: t`Completed`,
          autoClose: 1000,
          loading: false,
        });
      }
      if (args.onFinished) await args.onFinished(result, id);
      resolve(result);
    } catch (error) {
      if (args.throwError) {
        reject(error);
        notifications.hide(id);
      } else {
        onError(error, id);
        resolve({} as any);
      }
    }
  });
}

export function onSuccess(args: { title?: string; message: string }) {
  notifications.show({
    title: args.title || t`Success`,
    message: args.message,
    color: "green",
    icon: <IconCheck strokeWidth={1.5} size={18} />,
    autoClose: 3000,
  });
}

export function onArchive<T = any>(args: {
  name?: string | ReactNode;
  color?: string;
  icon?: Icon;
  children?: ReactNode;
  process: () => Promise<T>;
}) {
  onConfirmModal({
    type: "danger",
    title: args.name ? <Trans>Remove {args.name}</Trans> : <Trans>Remove data</Trans>,
    content: args.children ?? (
      <Trans>Are you sure you want to continue? This action cannot be undone.</Trans>
    ),
    icon: IconArchive,
    onConfirm: args.process,
    confirmLabel: <Trans>Archive</Trans>,
  });
}
