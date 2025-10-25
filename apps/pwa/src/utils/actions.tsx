import { type AppMetadata } from "@/types";
import { ModalTitle } from "@/components/modal-title";
import { tl } from "@/modules/lang/lang-service";
import { onError } from "@/utils/exceptions.utils";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { Icon, IconArchive, IconCheck } from "@tabler/icons-react";
import { getGlobal } from "@/global";

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
      title: args.name || tl("processing"),
      message: tl("waiting"),
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
          message: tl("completed"),
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
    title: args.title || tl("success"),
    message: args.message,
    color: "green",
    icon: <IconCheck strokeWidth={1.5} size={18} />,
    autoClose: 3000,
  });
}

export function onArchive<T = any>(args: {
  name?: string;
  title?: string;
  color?: string;
  icon?: Icon;
  children?: React.ReactNode;
  onArchived?: (result: T) => void;
  process: () => Promise<T>;
}) {
  const modalId = `${args.name}-archived`;
  const color = "red";

  return new Promise<void>((resolve) => {
    modals.openConfirmModal({
      modalId,
      title: (
        <ModalTitle
          title={args.title || `${tl("remove")} ${tl(args.name || "data")}`}
          color={color}
          icon={args.icon || IconArchive}
        />
      ),
      children: args.children || tl("archive_confirmation_msg"),
      color: color,
      labels: { confirm: tl("archive"), cancel: tl("cancel") },
      confirmProps: { color },
      onConfirm: async () => {
        await args
          .process()
          .then((res) => args.onArchived?.(res))
          .catch(onError);
        resolve();
      },
      onClose: () => {
        resolve();
      },
      onCancel: () => {
        modals.close(modalId);
        resolve();
      },
    });
  });
}
