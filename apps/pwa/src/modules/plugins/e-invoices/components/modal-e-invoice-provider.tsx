"use client";

import { Button } from "@/components/buttons/button";
import { ModalHead } from "@/components/modal/modal-head";
import { PluginEInvoicesProviderType } from "@/graphql/enums.graphql";
import { CreatePluginEInvoiceProviderInput } from "@/graphql/types.graphql";
import { onError } from "@/utils/exceptions.utils";
import { useApolloClient, useQuery } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Center, PasswordInput, Select, Skeleton, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { IconFileInvoice } from "@tabler/icons-react";
import { FC, Fragment, useEffect, useMemo } from "react";
import CreateEInvoiceProviderDocument from "../graphql/createEInvoiceProvider.graphql";
import { PluginEInvoiceProviderFragment } from "../graphql/fragmentPluginEInvoiceProvider.graphql";
import GetEInvoicesProviderInformationsDocument from "../graphql/getEInvoicesProviderInformations.graphql";
import UpdateEInvoiceProviderDocument from "../graphql/updateEInvoiceProvider.graphql";

type ModalEInvoiceProviderProps = ({} | { provider: PluginEInvoiceProviderFragment }) & {
  mode: "create" | "update_provider" | "update_auth";
  onDone: (provider: PluginEInvoiceProviderFragment) => unknown | Promise<unknown>;
};

const ModalEInvoiceProvider: FC<ModalEInvoiceProviderProps> = (props) => {
  const { t } = useLingui();
  const provider = "provider" in props ? props.provider : undefined;
  const client = useApolloClient();
  const { mode } = props;

  const { data: providerConfigs, loading: providerConfigsLoading } = useQuery(
    GetEInvoicesProviderInformationsDocument,
  );

  const form = useForm<Partial<CreatePluginEInvoiceProviderInput>>({
    initialValues: {},
    validate: {
      type: (v) => {
        if (!v) return t`Must be provided`;
      },
    },
  });

  useEffect(() => {
    if (providerConfigs) {
      form.setInitialValues({
        type: provider?.type ?? PluginEInvoicesProviderType.Matbao,
        auth: {},
        templates: provider?.templates ?? {},
        apiUrl: provider?.apiUrl,
      });
      form.reset();
    }
  }, [providerConfigs, provider]);

  const providerAuthForm = useMemo(() => {
    if (!form.values.type || (mode !== "update_auth" && mode !== "create")) return null;

    if (
      [PluginEInvoicesProviderType.Matbao, PluginEInvoicesProviderType.MatbaoDemo].includes(
        form.values.type,
      )
    ) {
      return (
        <Fragment>
          <TextInput {...form.getInputProps("auth.MST")} label={<Trans>Tax code</Trans>} />
          <TextInput
            {...form.getInputProps("auth.TDNhap")}
            label={<Trans>Sign in username</Trans>}
          />
          <PasswordInput {...form.getInputProps("auth.MKhau")} label={<Trans>Password</Trans>} />
        </Fragment>
      );
    }
  }, [mode, form.values.type]);

  const onSubmit = form.onSubmit(async (values) => {
    try {
      if (!values.type || !providerConfigs) return;

      const payload = {
        ...values,
        auth: mode === "create" || mode === "update_auth" ? values.auth : undefined,
        templates:
          mode === "create"
            ? (providerConfigs.getEInvoicesProviderInformations.find(
                (info) => info.type === values.type,
              )?.defaultTemplates ?? {})
            : (provider?.templates ?? {}),
      };

      const data = provider
        ? await client
            .mutate({
              mutation: UpdateEInvoiceProviderDocument,
              variables: {
                providerId: provider._id,
                input: payload,
              },
            })
            .then((res) => res.data?.provider)
        : await client
            .mutate({
              mutation: CreateEInvoiceProviderDocument,
              variables: {
                input: {
                  auth: values.auth!,
                  templates: payload.templates,
                  type: values.type,
                  apiUrl: payload.apiUrl,
                },
              },
            })
            .then((res) => res.data?.provider);

      if (data) await props.onDone?.(data);
    } catch (error) {
      onError(error);
    }
  });

  if (providerConfigsLoading || !providerConfigs) return <Skeleton height={100} />;

  return (
    <form onSubmit={onSubmit}>
      <Stack>
        <Select
          label={<Trans>Provider</Trans>}
          data={providerConfigs.getEInvoicesProviderInformations.map((info) => ({
            label: info.name,
            value: info.type,
          }))}
          {...form.getInputProps("type")}
          disabled={provider && mode === "update_auth"}
        />

        {mode !== "update_auth" && (
          <TextInput
            {...form.getInputProps("apiUrl")}
            label={
              <Fragment>
                API URL{" "}
                <small>
                  (<Trans>Optional</Trans>)
                </small>
              </Fragment>
            }
          />
        )}

        {providerAuthForm}

        <Center mt={8}>
          <Button loading={form.submitting} type="submit">
            {provider ? <Trans>Update</Trans> : <Trans>Complete</Trans>}
          </Button>
        </Center>
      </Stack>
    </form>
  );
};

export const OnModalEInvoiceProvider = (props: ModalEInvoiceProviderProps) => {
  const provider = props && "provider" in props ? props.provider : undefined;

  modals.open({
    modalId: "OnModalEInvoiceProvider",
    title: (
      <ModalHead
        name={
          provider ? (
            <Trans>Edit E-invoices provider</Trans>
          ) : (
            <Trans>Add E-invoices provider</Trans>
          )
        }
        icon={IconFileInvoice}
      />
    ),
    children: (
      <ModalEInvoiceProvider
        {...props}
        onDone={async (data) => {
          await props?.onDone?.(data);
          modals.close("OnModalEInvoiceProvider");
        }}
      />
    ),
  });
};
