"use client";

import { useColor } from "@/modules/theme/use-color";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Anchor, Button, Stack, Text, Title, em } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { FC, useState } from "react";
import { MailerIllustration } from "@/components/illustrations/mailer";
import { PluginMailerForm } from "./plugin-mailer-form";

export const PluginMailer: FC = () => {
  const workspace = useWorkspace();
  const color = useColor();
  const [isShowForm, setIsShowForm] = useState(false);

  if (isShowForm) return <PluginMailerForm onDone={() => setIsShowForm(false)} />;

  if (workspace.settings.mailer)
    return (
      <Stack align="center">
        <MailerIllustration width={200} />

        <Stack gap={8}>
          <Title ta="center" order={2} fw={300} c={color("primary")}>
            Đã đăng ký tài khoản Email
          </Title>

          <Text ta="center">
            Hệ thống đang dùng email <strong>{workspace.settings.mailer.user}</strong> để gửi Mail
            cho khách hàng hoặc các thông báo hệ thống cho thành viên.
          </Text>
        </Stack>

        <Anchor c="gray" mt={10} fw={300} fz={em(14)} onClick={() => setIsShowForm(true)}>
          Dùng tài khoản khác
        </Anchor>
      </Stack>
    );

  return (
    <Stack align="center" py={20}>
      <MailerIllustration width={200} />

      <Stack gap={8}>
        <Title ta="center" order={2} fw={300} c={color("primary")}>
          Tuỳ biến tài khoản gửi Mail
        </Title>

        <Text ta="center">
          Thiết lập tài khoản gửi Mail riêng nhằm giúp khách hàng dễ dàng nhận diện thương hiệu của
          bạn.
        </Text>
      </Stack>

      <Button
        mt={10}
        type="submit"
        onClick={() => setIsShowForm(true)}
        rightSection={<IconArrowRight strokeWidth={1.5} />}
      >
        Bắt đầu ngay
      </Button>
    </Stack>
  );
};
