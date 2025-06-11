"use client";

import { Animate } from "@/components/animate/animate";
import { useCloseAppLoading } from "@/components/app-loading";
import { Button } from "@/components/buttons/button";
import { ButtonLanguage } from "@/components/buttons/button-language";
import { ColorSchemes } from "@/components/color-schemes";
import { Image } from "@/components/image";
import { TextInput } from "@/components/inputs/text-input";
import { Pattern } from "@/components/pattern";
import { Renderer } from "@/components/renderer";
import { useLayout } from "@/layout/layout-context";
import { useAuth } from "@/modules/auth/auth-context";
import { useColor } from "@/modules/theme/use-color";
import { onError, onFormErrorLegacy } from "@/utils/exceptions.utils";
import {
  Anchor,
  Card,
  Center,
  Divider,
  Group,
  PasswordInput,
  PinInput,
  ScrollArea,
  Stack,
  Text,
  Title,
  em,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconLock, IconMail, IconUser } from "@tabler/icons-react";
import { FC, Fragment, useEffect, useState } from "react";
import { useApp } from "../../app.context";
import { t } from "../lang/lang-service";
import { renewPassword, requestRenewPassword, verifyRenewPasswordCode } from "./auth-service";

export const AuthRequire: FC = () => {
  useCloseAppLoading();

  const app = useApp();
  const layout = useLayout();
  const auth = useAuth();

  const [authType, setAuthType] = useState<"register" | "signin" | "forgot-password">("signin");
  const color = useColor();

  const authProviders = [
    {
      name: "Google",
      icon: "/images/auth-providers/google.png",
      onClick: auth.signInWithGoogle,
    },
    {
      name: "Facebook",
      icon: "/images/auth-providers/facebook.png",
      onClick: auth.signInWithFacebook,
    },
    {
      name: "Github",
      icon: "/images/auth-providers/github.png",
      onClick: auth.signInWithGithub,
    },
  ];

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const authType = search.get("authType");
    const invitation = search.get("invitation");
    if (authType === "register" || invitation) setAuthType("register");
    if (authType === "signin") setAuthType("signin");
  }, []);

  return (
    <Stack
      h={layout.height}
      w={layout.width}
      style={{ position: "relative", overflow: "hidden" }}
      bg="var(--mantine-color-body)"
    >
      <Pattern color={color("primary")} />

      <ScrollArea.Autosize w={layout.width} mah={layout.height} scrollbars="y">
        <Stack mih={layout.height} w={layout.width} p={16}>
          <Group justify="space-between" wrap="nowrap">
            <Group align="center" wrap="nowrap">
              <Animate src="/animate/symbol-idle.json" style={{ width: 45, height: 45 }} />

              <Stack gap={0}>
                <Title fz={28} fw={800} c={color("primary")}>
                  Joy One
                </Title>
                <Text fz={14} c="gray">
                  Enjoy Work in One Place
                </Text>
              </Stack>
            </Group>

            <Group justify="end" gap={8}>
              {(function () {
                if (authType === "signin")
                  return (
                    <Group gap={8}>
                      <Renderer views={["desktop", "tablet"]}>
                        <Text fz={em(14)}>{t("you_not_have_account")}</Text>
                      </Renderer>

                      <Button size="xs" onClick={() => setAuthType("register")}>
                        {t("register")}
                      </Button>
                    </Group>
                  );

                if (authType === "register")
                  return (
                    <Group gap={8}>
                      <Renderer views={["desktop", "tablet"]}>
                        <Text fz={em(14)}>{t("you_have_account")}</Text>
                      </Renderer>

                      <Button size="xs" onClick={() => setAuthType("signin")}>
                        {t("login")}
                      </Button>
                    </Group>
                  );

                return (
                  <Group gap={8}>
                    <Renderer views={["desktop", "tablet"]}>
                      <Text fz={em(14)}>{t("back_to_login")}</Text>
                    </Renderer>

                    <Button size="xs" onClick={() => setAuthType("signin")}>
                      {t("login")}
                    </Button>
                  </Group>
                );
              })()}

              <ColorSchemes />
            </Group>
          </Group>

          <Stack
            flex={1}
            justify="center"
            align="center"
            p={layout.view === "desktop" ? 20 : 5}
            pb={layout.view === "desktop" ? 100 : undefined}
          >
            <Card
              style={{
                boxShadow: `0 0 20px ${color({ light: "primary.2", dark: "transparent" })}`,
                border: `2px solid ${color("primary.4")}`,
                maxWidth: "100%",
                width: 480,
              }}
              radius={16}
            >
              <Stack align="stretch" p={layout.view === "desktop" ? 15 : 10}>
                <Title
                  fz={em(layout.view === "mobile" ? 22 : 28)}
                  ta="center"
                  fw="700"
                  c="var(--mantine-color-bright)"
                >
                  {(function () {
                    if (authType === "forgot-password") return `${t("forgot_password")}?`;
                    if (authType === "signin") return t("hello");
                    return t("register_new_account");
                  })()}
                </Title>

                {(function () {
                  if (authType === "forgot-password")
                    return <ForgotPassword onFinish={() => setAuthType("signin")} />;

                  return (
                    <Fragment>
                      {authType === "signin" ? (
                        <SignIn onForgotPassword={() => setAuthType("forgot-password")} />
                      ) : (
                        <Register />
                      )}

                      <Divider label={t("or")} labelPosition="center" />

                      {authProviders.map((authProvider) => {
                        return (
                          <Button
                            key={authProvider.name}
                            variant="outline"
                            radius={100}
                            size="md"
                            color="gray"
                            leftSection={<Image src={authProvider.icon} h={20} w={20} />}
                            onClick={authProvider.onClick}
                            style={{
                              borderColor: color({ light: "gray.3", dark: "gray.7" }),
                            }}
                          >
                            {t("continue_with")} {authProvider.name}
                          </Button>
                        );
                      })}
                    </Fragment>
                  );
                })()}
              </Stack>
            </Card>

            <ButtonLanguage />
          </Stack>
        </Stack>
      </ScrollArea.Autosize>
    </Stack>
  );
};

const Register: FC = () => {
  const auth = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      plainPassword: "",
    },
    validate: {
      name: (v: string) => {
        if (!v) return t("must_be_provided");
      },
      email: (v: string) => {
        if (!v) return t("must_be_provided");
      },
      plainPassword: (v: string) => {
        if (!v) return t("must_be_provided");
        if (v.length < 6) return t("password_length", { length: 6 });
      },
    },
  });

  useEffect(() => {
    if (form.values.email !== "") {
      form.setFieldValue("email", form.values.email.toLowerCase());
    }
  }, [form.values.email]);

  const onSubmit = form.onSubmit(async (values) => {
    setIsSubmitting(true);
    await auth
      .registerWithEmailAndPassword({
        ...values,
        plainPassword: values.plainPassword,
      })
      .catch(onFormErrorLegacy(form));
    setIsSubmitting(false);
  });

  return (
    <form onSubmit={onSubmit}>
      <Stack>
        <TextInput
          label={t("name")}
          autoFocus
          size="md"
          leftSection={<IconUser strokeWidth={1.5} size={18} />}
          placeholder="Jason Tran"
          {...form.getInputProps("name")}
        />

        <TextInput
          label="Email"
          size="md"
          leftSection={<IconMail strokeWidth={1.5} size={18} />}
          placeholder="example@gmail.com"
          {...form.getInputProps("email")}
        />

        <PasswordInput
          label={t("password")}
          size="md"
          placeholder={t("password_length", { length: 6 }) as string}
          leftSection={<IconLock strokeWidth={1.5} size={18} />}
          {...form.getInputProps("plainPassword")}
        />

        <Button mt={16} loading={isSubmitting} type="submit" h={42}>
          {t("register")}
        </Button>
      </Stack>
    </form>
  );
};

const SignIn: FC<{ onForgotPassword: () => void }> = (props) => {
  const auth = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      email: "",
      plainPassword: "",
    },
    validate: {
      email: (v: string) => {
        if (!v) return t("must_be_provided");
      },
      plainPassword: (v: string) => {
        if (!v) return t("must_be_provided");
      },
    },
  });

  useEffect(() => {
    if (form.values.email !== "") {
      form.setFieldValue("email", form.values.email.toLowerCase());
    }
  }, [form.values.email]);

  const onSubmit = form.onSubmit(async (values) => {
    setIsSubmitting(true);
    await auth
      .signInWithEmailAndPassword({
        email: values.email,
        password: values.plainPassword,
      })
      .catch(onFormErrorLegacy(form));
    setIsSubmitting(false);
  });

  return (
    <form onSubmit={onSubmit}>
      <Stack>
        <TextInput
          label="Email"
          placeholder={t("enter_your_email") as string}
          {...form.getInputProps("email")}
          leftSection={<IconMail strokeWidth={1.5} size={18} />}
          autoFocus
        />

        <PasswordInput
          label={t("password")}
          {...form.getInputProps("plainPassword")}
          placeholder={t("enter_your_password") as string}
          leftSection={<IconLock strokeWidth={1.5} size={18} />}
        />

        <Button mt={16} loading={isSubmitting} type="submit" h={42}>
          {t("login")}
        </Button>

        <Anchor onClick={props.onForgotPassword} ta="center" mt={16} fz={em(14)}>
          {t("forgot_password")}?
        </Anchor>
      </Stack>
    </form>
  );
};

const ForgotPassword: FC<{ onFinish: () => void }> = (props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const form = useForm({
    initialValues: {
      email: "",
      plainPassword: "",
      code: "",
    },
    validate: {
      email: (v: string) => {
        if (!v) return t("must_be_provided");
      },
      plainPassword: (v: string) => {
        if (!isVerified) return null;
        if (!v) return t("must_be_provided");
        if (v.length < 6) return t("password_length", { length: 6 });
      },
    },
  });

  useEffect(() => {
    if (form.values.email !== "") {
      form.setFieldValue("email", form.values.email.toLowerCase());
    }
  }, [form.values.email]);

  const onSubmit = form.onSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      if (!isVerified) {
        await requestRenewPassword(values);
        setIsSent(true);
        notifications.show({
          autoClose: true,
          title: `${t("notification")}`,
          message: t("sent_verification_code"),
          icon: <IconMail strokeWidth={1.5} size={18} />,
        });
      } else {
        await renewPassword(values);
        notifications.show({
          autoClose: true,
          title: t("success"),
          message: t("change_password_success"),
          icon: <IconLock strokeWidth={1.5} size={18} />,
        });
        props.onFinish();
      }
    } catch (error) {
      onFormErrorLegacy(form)(error);
    }
    setIsSubmitting(false);
  });

  const onVerify = async (code: string) => {
    try {
      await verifyRenewPasswordCode({ code });
      form.setFieldValue("code", code);
      setIsVerified(true);
    } catch (error) {
      onError(error);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <Stack>
        {(function () {
          if (isVerified) {
            return (
              <Fragment>
                <Text ta="center">{t("enter_new_password")}</Text>

                <PasswordInput
                  label={t("new_password")}
                  placeholder={t("password_length", { length: 6 }) as string}
                  leftSection={<IconLock strokeWidth={1.5} size={18} />}
                  {...form.getInputProps("plainPassword")}
                />

                <Button mt={16} loading={isSubmitting} type="submit" h={42}>
                  {t("change_password")}
                </Button>
              </Fragment>
            );
          }

          if (isSent)
            return (
              <Fragment>
                <Text ta="center">{t("forgot_password_msg")}</Text>

                <Center>
                  <PinInput length={6} oneTimeCode onComplete={onVerify} type="number" />
                </Center>

                <Anchor ta="center" onClick={() => onSubmit()} mt={16} fz={em(14)}>
                  {t("resend_verification_code")}
                </Anchor>
              </Fragment>
            );

          return (
            <Fragment>
              <TextInput
                label="Email"
                placeholder={t("enter_your_email") as string}
                {...form.getInputProps("email")}
                leftSection={<IconMail strokeWidth={1.5} size={18} />}
                autoFocus
              />

              <Button mt={16} loading={isSubmitting} type="submit">
                {t("next")}
              </Button>
            </Fragment>
          );
        })()}
      </Stack>
    </form>
  );
};
