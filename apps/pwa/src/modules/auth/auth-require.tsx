"use client";

import { Animate } from "@/components/animate/animate";
import { Button } from "@/components/buttons/button";
import { ButtonLanguage } from "@/components/buttons/button-language";
import { ColorSchemes } from "@/components/color-schemes";
import { Image } from "@/components/image";
import { Pattern } from "@/components/pattern";
import { Renderer } from "@/components/renderer";
import { useLayout } from "@/layout/layout-context";
import { useAuth } from "@/modules/auth/auth-context";
import { useColor } from "@/modules/theme/use-color";
import { Card, Divider, em, Group, ScrollArea, Stack, Text, Title } from "@mantine/core";
import { FC, Fragment, useEffect, useState } from "react";
import { useApp } from "../../app.context";
import { tl } from "@/modules/lang/lang-service";
import { FormForgotPassword } from "./components/form-forgot-password";
import { FormRegister } from "./components/form-register";
import { FormSignIn } from "./components/form-sign-in";

export const AuthRequire: FC = () => {
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

  const logoSize = layout.view === "desktop" ? 45 : 35;

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
                        <Text fz={em(14)}>{tl("you_not_have_account")}</Text>
                      </Renderer>

                      <Button size="xs" onClick={() => setAuthType("register")}>
                        {tl("register")}
                      </Button>
                    </Group>
                  );

                if (authType === "register")
                  return (
                    <Group gap={8}>
                      <Renderer views={["desktop", "tablet"]}>
                        <Text fz={em(14)}>{tl("you_have_account")}</Text>
                      </Renderer>

                      <Button size="xs" onClick={() => setAuthType("signin")}>
                        {tl("login")}
                      </Button>
                    </Group>
                  );

                return (
                  <Group gap={8}>
                    <Renderer views={["desktop", "tablet"]}>
                      <Text fz={em(14)}>{tl("back_to_login")}</Text>
                    </Renderer>

                    <Button size="xs" onClick={() => setAuthType("signin")}>
                      {tl("login")}
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
                    if (authType === "forgot-password") return `${tl("forgot_password")}?`;
                    if (authType === "signin") return tl("hello");
                    return tl("register_new_account");
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

                      <Divider label={tl("or")} labelPosition="center" />

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
                            {tl("continue_with")} {authProvider.name}
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
