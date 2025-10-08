import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { t } from "@/modules/lang/lang-service";
import { onError } from "@/utils/exceptions.utils";
import { PasswordInput, Select, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { IconFileInvoice } from "@tabler/icons-react";
import { FC, Fragment, useMemo } from "react";
import { PluginEInvoicesProviderEntity } from "./plugin-e-invoices.entities";
import { PluginEInvoicesProvider, PluginEInvoicesProviderDto } from "./plugin-e-invoices.types";
import { api } from "@/modules/apis";
import { eInvoicesProviders } from "./plugin-e-invoices.config";

interface ModalEInvoiceProviderProps {
  provider?: PluginEInvoicesProviderEntity;
  onDone?: (provider: PluginEInvoicesProviderEntity) => unknown | Promise<unknown>;
}

const ModalEInvoiceProvider: FC<ModalEInvoiceProviderProps> = (props) => {
  const form = useForm<Partial<PluginEInvoicesProviderDto>>({
    initialValues: {
      provider: props.provider?.provider ?? PluginEInvoicesProvider.MATBAO,
      providerAuth: {},
      templates: props.provider?.templates ?? {},
    },
    validate: {
      provider: (v: PluginEInvoicesProvider | undefined) => {
        if (!v) return t("must_be_provided");
      },
    },
  });

  const providerForm = useMemo(() => {
    if (form.values.provider === PluginEInvoicesProvider.MATBAO) {
      return (
        <Fragment>
          <TextInput {...form.getInputProps("providerAuth.MST")} label={t("tax_code")} />
          <TextInput {...form.getInputProps("providerAuth.TDNhap")} label={t("sign_in_username")} />
          <PasswordInput {...form.getInputProps("providerAuth.MKhau")} label={t("password")} />
        </Fragment>
      );
    }
  }, []);

  const onSubmit = form.onSubmit(async (values) => {
    try {
      const payload = {
        ...values,
        providerAuth:
          values.providerAuth && Object.keys(values.providerAuth).length > 0
            ? values.providerAuth
            : undefined,
      };

      const data = props?.provider
        ? await api.put<PluginEInvoicesProviderEntity>(
            `/plugins/e-invoices/providers/${props.provider._id}`,
            payload
          )
        : await api.post<PluginEInvoicesProviderEntity>(`/plugins/e-invoices/providers`, payload);

      await props.onDone?.(data);
    } catch (error) {
      onError(error);
    }
  });

  return (
    <form onSubmit={onSubmit}>
      <Stack>
        <Select
          label={t("provider")}
          data={Object.keys(eInvoicesProviders).map((provider) => ({
            label: eInvoicesProviders[provider as PluginEInvoicesProvider].name,
            value: provider,
          }))}
          {...form.getInputProps("provider")}
        />

        {providerForm}

        <Button loading={form.submitting} type="submit">
          {t(props?.provider ? "update" : "complete")}
        </Button>
      </Stack>
    </form>
  );
};

export const OnModalEInvoiceProvider = (props?: ModalEInvoiceProviderProps) => {
  modals.open({
    modalId: "OnModalEInvoiceProvider",
    title: (
      <ModalTitle
        title={t(props?.provider ? "edit_entity" : "add_entity", {
          entity: t("workspacePluginsEInvoiceProvider"),
        })}
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
