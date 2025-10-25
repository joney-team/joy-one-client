"use client";

import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { api } from "@/modules/apis";
import { useQuery } from "@/modules/apis/use-query";
import { onError } from "@/utils/exceptions.utils";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { PasswordInput, Select, Skeleton, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { IconFileInvoice } from "@tabler/icons-react";
import { FC, Fragment, useEffect, useMemo } from "react";
import { PluginEInvoicesProviderEntity } from "./plugin-e-invoices.entities";
import {
  PluginEInvoicesProviderDto,
  PluginEInvoicesProviderInformations,
  PluginEInvoicesProviderType,
} from "./plugin-e-invoices.types";

type ModalEInvoiceProviderProps = ({} | { provider: PluginEInvoicesProviderEntity }) & {
  mode: "create" | "update_provider" | "update_auth";
  onDone: (provider: PluginEInvoicesProviderEntity) => unknown | Promise<unknown>;
};

const ModalEInvoiceProvider: FC<ModalEInvoiceProviderProps> = (props) => {
  const provider = "provider" in props ? props.provider : undefined;
  const { mode } = props;

  const providerConfigs = useQuery<PluginEInvoicesProviderInformations>({
    route: "/plugins/e-invoices/providers/informations",
    networkMode: "offlineFirst",
  });

  const form = useForm<Partial<PluginEInvoicesProviderDto>>({
    initialValues: {},
    validate: {
      type: (v: PluginEInvoicesProviderType | undefined) => {
        if (!v) return t`Must be provided`;
      },
    },
  });

  useEffect(() => {
    if (providerConfigs.data) {
      form.setInitialValues({
        type: provider?.type ?? PluginEInvoicesProviderType.MATBAO,
        auth: {},
        templates: provider?.templates ?? {},
      });
      form.reset();
    }
  }, [providerConfigs.data, provider]);

  const providerForm = useMemo(() => {
    if (!form.values.type || mode === "update_provider") return null;

    if (
      [PluginEInvoicesProviderType.MATBAO, PluginEInvoicesProviderType.MATBAO_DEMO].includes(
        form.values.type
      )
    ) {
      return (
        <Fragment>
          <TextInput {...form.getInputProps("auth.MST")} label={t`Tax code`} />
          <TextInput {...form.getInputProps("auth.TDNhap")} label={t`Sign in username`} />
          <PasswordInput {...form.getInputProps("auth.MKhau")} label={t`Password`} />
        </Fragment>
      );
    }
  }, [mode, form.values.type]);

  const onSubmit = form.onSubmit(async (values) => {
    try {
      if (!values.type || !providerConfigs.data) return;

      const payload = {
        ...values,
        auth: mode === "create" || mode === "update_auth" ? values.auth : undefined,
        templates:
          mode === "create"
            ? providerConfigs.data[values.type].defaultTemplates ?? {}
            : provider?.templates ?? {},
      };

      const data = provider
        ? await api.put<PluginEInvoicesProviderEntity>(
            `/plugins/e-invoices/providers/${provider._id}`,
            payload
          )
        : await api.post<PluginEInvoicesProviderEntity>(`/plugins/e-invoices/providers`, payload);

      await props.onDone?.(data);
    } catch (error) {
      onError(error);
    }
  });

  if (providerConfigs.isLoading || !providerConfigs.data) return <Skeleton height={100} />;

  return (
    <form onSubmit={onSubmit}>
      <Stack>
        <Select
          label={t`Provider`}
          data={Object.entries(providerConfigs.data ?? {}).map(([type, info]) => ({
            label: info.name,
            value: type,
          }))}
          {...form.getInputProps("type")}
          disabled={provider && mode === "update_auth"}
        />

        {providerForm}

        <Button loading={form.submitting} type="submit">
          {provider ? <Trans>Update</Trans> : <Trans>Complete</Trans>}
        </Button>
      </Stack>
    </form>
  );
};

export const OnModalEInvoiceProvider = (props: ModalEInvoiceProviderProps) => {
  const provider = props && "provider" in props ? props.provider : undefined;

  modals.open({
    modalId: "OnModalEInvoiceProvider",
    title: (
      <ModalTitle
        title={t`${provider ? t`Edit` : t`Add`} E-invoices provider`}
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
