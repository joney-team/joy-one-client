import { Button } from "@/components/buttons/button";
import { TextInput } from "@/components/inputs/text-input";
import { t } from "@/modules/lang/lang-service";
import { MainRequest } from "@/modules/requests/main.request";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { setWorkspaceSettings } from "@/modules/workspace-settings/workspace-settings-service";
import { onError } from "@/utils/exceptions.utils";
import { Anchor, Card, Group, PasswordInput, Stack, Stepper, Text, ThemeIcon, Title, em } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconArrowLeft, IconCircleCheck, IconSend } from "@tabler/icons-react";
import { FC, useState } from "react";

interface MailerFormProps {
  onDone?: () => void;
}

export const PluginMailerForm: FC<MailerFormProps> = (props) => {
  const workspace = useWorkspace();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [active, setActive] = useState(0);

  const form = useForm({
    initialValues: {
      user: "",
      pass: "",
      testEmail: "",
    },
    validate: {
      user: (value: string) => {
        if (!value) return t("must_be_provided");
      },
      pass: (value: string) => {
        if (!value) return t("must_be_provided");
      },
    },
  });

  const onSubmit = form.onSubmit(async (payload) => {
    if (active === 0) {
      setActive(1);
    }

    if (active === 1) {
      if (!payload.testEmail) form.setFieldError("testEmail", "Vui lòng nhập email nhận");
      else {
        setIsSubmitting(true);
        try {
          await MainRequest.post("/plugins/mailer/workspace/test", {
            to: payload.testEmail,
            accountUser: payload.user,
            accountPass: payload.pass,
          });
          setActive(2);
        } catch (error) {
          onError(error);
        }
        setIsSubmitting(false);
      }
    }

    if (active === 2) {
      setIsSubmitting(true);
      try {
        await setWorkspaceSettings({ ...workspace.settings, mailer: payload });
        props.onDone?.();
      } catch (error) {
        onError(error);
      }
      setIsSubmitting(false);
    }
  });

  return (
    <Stepper active={active} onStepClick={setActive} size="xs">
      <Stepper.Step label="Tài khoản Gmail">
        <Card shadow="none" withBorder bg="var(--mantine-color-body)">
          <Stack>
            <TextInput label="Địa chỉ Gmail" {...form.getInputProps("user")} />

            <PasswordInput label="Mật khẩu ứng dụng" {...form.getInputProps("pass")} />

            <Button type="submit" loading={isSubmitting} onClick={onSubmit}>
              Tiếp tục
            </Button>

            <Anchor ta="center" c="gray" mt={5} fw={300} fz={em(14)} onClick={props.onDone}>
              Dùng Mail mặc định
            </Anchor>
          </Stack>
        </Card>
      </Stepper.Step>
      <Stepper.Step label="Gửi mẫu thữ">
        <Card shadow="none" withBorder bg="var(--mantine-color-body)">
          <Stack>
            <TextInput label="Email nhận" {...form.getInputProps("testEmail")} />

            {isSubmitting && (
              <Text ta="center" fw={300} fz={em(14)}>
                Bạn vui lòng kiên nhẫn chờ đợi <br /> có thể mất khoảng 1 - 2 phút để hệ thống gửi thử mail.
              </Text>
            )}

            <Group wrap="nowrap">
              <Button
                type="submit"
                variant="light"
                color="gray"
                onClick={() => setActive(0)}
                leftSection={<IconArrowLeft strokeWidth={1.5} />}
                fullWidth
              >
                Trở lại
              </Button>

              <Button
                type="submit"
                loading={isSubmitting}
                onClick={onSubmit}
                fullWidth
                rightSection={<IconSend strokeWidth={1.5} />}
              >
                Gửi thử
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stepper.Step>
      <Stepper.Step label="Hoàn thành">
        <Card shadow="none" withBorder bg="var(--mantine-color-body)" pb={20}>
          <Stack align="center">
            <ThemeIcon variant="transparent" size="xl">
              <IconCircleCheck strokeWidth={1.2} size={150} />
            </ThemeIcon>

            <Title mt={-10} ta="center" order={2} fw={300} c="primary">
              Kiểm Thữ Thành Công!
            </Title>

            <Text ta="center">
              Sau khi xác nhận hệ thống sẽ dùng địa chỉ email <strong>{form.values.user}</strong> để gửi Mail cho khách
              hàng <br /> hoặc các thông báo hệ thống cho thành viên.
            </Text>

            <Button mt={10} type="submit" loading={isSubmitting} onClick={onSubmit}>
              Xác nhận áp dụng
            </Button>

            <Anchor c="gray" mt={10} fw={300} fz={em(14)} onClick={() => setActive(0)}>
              Dùng tài khoản khác
            </Anchor>
          </Stack>
        </Card>
      </Stepper.Step>
    </Stepper>
  );
};
