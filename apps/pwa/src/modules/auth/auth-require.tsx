"use client";

import { Animate } from "@/components/animate/animate";
import { Button } from "@/components/buttons/button";
import { ButtonLanguage } from "@/components/buttons/button-language";
import { ColorSchemes } from "@/components/color-schemes";
import { Image } from "@/components/image";
import { Pattern } from "@/components/pattern/pattern";
import { Renderer } from "@/components/renderer";
import { useLayout } from "@/layout/layout-context";
import { useAuth } from "@/modules/auth/auth-context";
import { useColor } from "@/modules/theme/use-color";
import { Trans } from "@lingui/react/macro";
import { Card, Divider, em, Group, ScrollArea, Stack, Text, Title } from "@mantine/core";
import { FC, Fragment, useEffect, useState } from "react";
import { useApp } from "../../app.context";
import { FormForgotPassword } from "./components/form-forgot-password";
import { FormRegister } from "./components/form-register";
import { FormSignIn } from "./components/form-sign-in";
import { useRouteRule } from "@/hooks/use-router";
import { Fullscreen } from "@/components/fullscreen";
import { zIndexes } from "@joy-one-client/config/layout";

export const AuthRequire: FC = () => {
  const app = useApp();
  const layout = useLayout();
  const auth = useAuth();
  const routeRule = useRouteRule();

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

  const logoSize = layout.view === "desktop" ? 45 : 35;

  if (auth.isInitialized && !auth.user && routeRule.auth !== "public") {
    return (
      <Fullscreen zIndex={zIndexes.requireAuth}>
        <Stack
          h={layout.height}
          w={layout.width}
          style={{ position: "relative", overflow: "hidden" }}
          bg="var(--mantine-color-body)"
        >
          <Pattern />

          <ScrollArea.Autosize w={layout.width} mah={layout.height} scrollbars="y">
            <Stack mih={layout.height} w={layout.width} p={16}>
              <Group justify="space-between" wrap="nowrap">
                <Group align="center" wrap="nowrap" gap={layout.view === "desktop" ? 16 : 8}>
                  {app.metadata.isExtended ? (
                    <Image src={app.metadata.appIcon} h={logoSize} w={logoSize} />
                  ) : (
                    <Animate
                      src="/animate/symbol-idle.json"
                      style={{ width: logoSize, height: logoSize }}
                    />
                  )}

                  <Stack gap={0}>
                    <Title fz={{ base: 22, md: 28 }} fw={800} c={color("primary")}>
                      {app.metadata.appName || "Joy One"}
                    </Title>
                    <Text fz={{ base: 12, md: 14 }} c="gray">
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
                            <Text fz="xs">
                              <Trans>You don't have an account?</Trans>
                            </Text>
                          </Renderer>

                          <Button size="xs" onClick={() => setAuthType("register")}>
                            <Trans>Register</Trans>
                          </Button>
                        </Group>
                      );

                    if (authType === "register")
                      return (
                        <Group gap={8}>
                          <Renderer views={["desktop", "tablet"]}>
                            <Text fz="xs">
                              <Trans>You have an account?</Trans>
                            </Text>
                          </Renderer>

                          <Button size="xs" onClick={() => setAuthType("signin")}>
                            <Trans>Login</Trans>
                          </Button>
                        </Group>
                      );

                    return (
                      <Group gap={8}>
                        <Renderer views={["desktop", "tablet"]}>
                          <Text fz="xs">
                            <Trans>Back to login</Trans>
                          </Text>
                        </Renderer>

                        <Button size="xs" onClick={() => setAuthType("signin")}>
                          <Trans>Login</Trans>
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
                        if (authType === "forgot-password") return <Trans>Forgot password?</Trans>;
                        if (authType === "signin") return <Trans>Hello!</Trans>;
                        return <Trans>Register new account</Trans>;
                      })()}
                    </Title>

                    {(function () {
                      if (authType === "forgot-password")
                        return <FormForgotPassword onFinish={() => setAuthType("signin")} />;

                      return (
                        <Fragment>
                          {authType === "signin" ? (
                            <FormSignIn onForgotPassword={() => setAuthType("forgot-password")} />
                          ) : (
                            <FormRegister />
                          )}

                          <Divider label={<Trans>Or</Trans>} labelPosition="center" />

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
                                fz={14}
                              >
                                <Trans>Continue with</Trans> {authProvider.name}
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
      </Fullscreen>
    );
  }

  return null;
};
