import { t } from "@lingui/core/macro";
import { rem, Text } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { NotificationData, notifications } from "@mantine/notifications";
import { IconInfoCircle, IconMoodCry } from "@tabler/icons-react";
import { AxiosError } from "axios";
import { String } from "./string.utils";

export const onError = (
  error: any,
  notification?: NotificationData | string,
  throwError?: boolean
) => {
  let message: string = t`Internal server error`;

  if (error instanceof AxiosError) {
    message = error.response?.data?.message || error.message;
  } else if (typeof error === "string") {
    message = error;
  } else if (error instanceof Error) {
    message = error.message;
  }

  if (notification) {
    if (typeof notification === "string") {
      notifications.update({
        id: notification,
        message: (
          <Text dangerouslySetInnerHTML={{ __html: String.replaceLineBreaksToHTML(message) }} />
        ),
        color: "red",
        loading: false,
        autoClose: true,
        icon: <IconMoodCry strokeWidth={1.5} size={18} />,
      });
    } else {
      notifications.update({
        ...notification,
        message: (
          <Text dangerouslySetInnerHTML={{ __html: String.replaceLineBreaksToHTML(message) }} />
        ),
        color: "red",
        loading: false,
        autoClose: true,
        icon: <IconMoodCry strokeWidth={1.5} size={18} />,
      });
    }
  } else {
    notifications.show({
      title: t`Action failed`,
      message: (
        <Text dangerouslySetInnerHTML={{ __html: String.replaceLineBreaksToHTML(message) }} />
      ),
      color: "red",
      icon: <IconMoodCry strokeWidth={1.5} size={18} />,
      autoClose: true,
    });
  }

  if (throwError) throw error;
};

export const onInfo = (msg: string) => {
  return notifications.show({
    title: t`Notification`,
    message: msg,
    color: "blue",
    icon: <IconInfoCircle style={{ width: rem(20), height: rem(20) }} />,
  });
};

export const onFormErrorLegacy = (form: UseFormReturnType<any>) => {
  return (error: any) => {
    onError(error);

    if (error instanceof AxiosError) {
      const { errors } = error.response?.data || {};

      if (errors) {
        form.setErrors(errors);
      }
    }
  };
};

export function onFormError<T>(form: UseFormReturnType<T>, error: any) {
  if (error instanceof AxiosError) {
    const { errors } = error.response?.data || {};
    if (errors && Object.keys(errors).length > 0) return form.setErrors(errors);
  }

  return onError(error);
}

export const onErrorLog = (error: any) => {
  console.error(error);
};
