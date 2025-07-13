"use client";

import { Button } from "@/components/buttons/button";
import { ModalTitle } from "@/components/modal-title";
import { useLayout } from "@/layout/layout-context";
import { getCustomer, renderGener } from "@/modules/customers/customer-service";
import { CustomerEntity, CustomerShortInfo } from "@/modules/customers/customer-types";
import { renderLink } from "@/modules/files/files-utils";
import { num, renderDateTime, t } from "@/modules/lang/lang-service";
import { renderLocation } from "@/modules/locations/locations-service";
import { OrderEntity } from "@/modules/orders/order-entity";
import { getOrderById } from "@/modules/orders/orders-service";
import { BankQrCode } from "@/modules/plugins/banks/banks.types";
import { PrescriptionEntity } from "@/modules/prescriptions/prescriptions-types";
import { ReceiptEntity } from "@/modules/receipts/receipts-types";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { loadImage } from "@/utils/asset.utils";
import { wait } from "@/utils/common.utils";
import { onError } from "@/utils/exceptions.utils";
import { capitalize, uppercase } from "@/utils/string.utils";
import { zIndexes } from "@joy-one-client/config/layout";
import {
  ActionIcon,
  Anchor,
  Card,
  Center,
  Divider,
  Group,
  Modal,
  Skeleton,
  Stack,
  Switch,
  ThemeIcon,
  Tooltip,
  em,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useForceUpdate } from "@mantine/hooks";
import { IconDimensions, IconPrinter, IconSettings } from "@tabler/icons-react";
import { type FC, Fragment, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

interface PrinterProps {
  label?: string;
  receipt?: ReceiptEntity;
  bankQrCode?: BankQrCode;
  prescription?: PrescriptionEntity;
  customer?: Pick<CustomerShortInfo, "_id">;
  order?: OrderEntity;
}

interface ModalPrinterProps extends PrinterProps {
  force?: boolean;
}

export let OnModalPrinter: (props: ModalPrinterProps) => Promise<void> = async () => {};

export enum PrintSize {
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE",
}

function printSizeLabel(size?: PrintSize) {
  return {
    [PrintSize.LARGE]: "large",
    [PrintSize.MEDIUM]: "medium",
    [PrintSize.SMALL]: "small",
  }[size || PrintSize.MEDIUM];
}

interface PrintSettings {
  size: PrintSize;
  showLogo: boolean;
  showBankQrCode?: boolean;
  showAddress?: boolean;
  showCashier?: boolean;
  showThanks?: boolean;
  showCurrency?: boolean;
  showCustomer?: boolean;
}

const printSettingsKey = "print-settings-v2";

const getPrintSettings = (): PrintSettings => {
  let settings: PrintSettings = {
    showLogo: true,
    size: PrintSize.MEDIUM,
    showBankQrCode: true,
    showAddress: true,
    showCashier: true,
    showThanks: false,
    showCurrency: true,
    showCustomer: true,
  };

  try {
    const backup = localStorage.getItem(printSettingsKey);
    if (backup) settings = JSON.parse(backup);
  } catch (error) {}

  return settings;
};

const setPrintSettings = (settings: PrintSettings) => {
  localStorage.setItem(printSettingsKey, JSON.stringify(settings));
};

let currentProps: ModalPrinterProps = {};

export const ModalPrinter: FC = () => {
  const forceUpdate = useForceUpdate();
  const printSettings = getPrintSettings();
  const viewport = useLayout();
  const workspace = useWorkspace();

  const [opened, { open, close }] = useDisclosure(false);
  const [props, setProps] = useState<ModalPrinterProps>();
  const [loading, setIsLoading] = useState(true);
  const [relatedOrder, setRelatedOrder] = useState<OrderEntity>();
  const [customer, setCustomer] = useState<CustomerEntity>();

  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef,
    onAfterPrint: () => {
      if (currentProps?.force) close();
    },
    onPrintError: (error) => {
      onError(error);
    },
  });

  const changePrintSettings = (settings: PrintSettings) => {
    setPrintSettings(settings);
    forceUpdate();
  };

  OnModalPrinter = async (p) => {
    setIsLoading(true);

    try {
      let _p = { ...p };

      if (_p.bankQrCode) {
        _p.bankQrCode.url = _p.bankQrCode.url.replace("compact", "qr_only");
        loadImage(_p.bankQrCode.url);
      }

      if (_p.receipt?.relatedOrderId) {
        const order = await getOrderById(_p.receipt.relatedOrderId);
        setRelatedOrder(order);
      }

      const customerId =
        _p.customer?._id || _p.order?.relatedCustomerId || _p.receipt?.relatedCustomerId;
      if (customerId) {
        const customer = await getCustomer(customerId);
        setCustomer(customer);
      }

      currentProps = _p;
      setProps(_p);
      open();

      if (p.force) {
        await wait(100);
        handlePrint();
      }
    } catch (error) {
      onError(error);
      close();
    } finally {
      setIsLoading(false);
    }
  };

  function getTitle() {
    if (props?.receipt) return `${t("print")} ${t("receipt")}`;
    if (props?.order) return `${t("print")} ${t("order")}`;
    if (props?.prescription) return `${t("print")} ${t("prescription")}`;

    return `${t("print")}`;
  }

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={<ModalTitle title={getTitle()} icon={IconPrinter} />}
      zIndex={zIndexes.modals + 1}
      yOffset={10}
      fullScreen={viewport.view === "mobile"}
      size="xl"
    >
      {(function () {
        if (!props) return null;
        if (loading) return <Skeleton h={300} />;

        return (
          <Stack align="center">
            <Card
              withBorder
              shadow="none"
              p={5}
              style={{
                width:
                  printSettings.size === PrintSize.SMALL
                    ? 200
                    : printSettings.size === PrintSize.MEDIUM
                    ? 300
                    : 800,
                maxWidth: "100%",
              }}
            >
              <div
                ref={contentRef}
                className={`printer printer-${printSettings.size.toLowerCase()}`}
              >
                <div className="printer-wrapper">
                  <div className="printer-head">
                    {printSettings.showLogo && !!workspace.userMember.workspace.logo && (
                      <img
                        className="logo"
                        src={renderLink(workspace.userMember.workspace.logo)}
                        alt=""
                      />
                    )}

                    <div className="printer-head-metadata">
                      <h3>{workspace.userMember.workspace.name}</h3>
                      <div
                        className={`flex ${printSettings.size === PrintSize.LARGE ? "" : "column"}`}
                      >
                        {(function () {
                          if (
                            !printSettings.showAddress ||
                            !workspace.userMember.workspace.location
                          )
                            return null;

                          if (printSettings.size === PrintSize.SMALL)
                            return (
                              <p>
                                ĐC:{" "}
                                {renderLocation(workspace.userMember.workspace.location, {
                                  shortProvine: true,
                                }).replace("Hồ Chí Minh", "HCM")}
                              </p>
                            );

                          return (
                            <p>
                              ĐC:{" "}
                              {renderLocation(workspace.userMember.workspace.location).replace(
                                /Thành phố/g,
                                "TP."
                              )}
                            </p>
                          );
                        })()}

                        {workspace.userMember.workspace.hotline && (
                          <p>Hotline: {workspace.userMember.workspace.hotline}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {(function () {
                    const { receipt } = props;
                    const order = props.order || relatedOrder;

                    if (order) {
                      const subTotalPrice = order.items.reduce((a, b) => a + b.price, 0);
                      const totalAmount = receipt
                        ? receipt.amount + (receipt.tipAmount || 0)
                        : order.totalAmount;
                      const renderMoney = (n: number) =>
                        num(n, { type: printSettings.showCurrency ? "money" : undefined });
                      const totalDiscount = order.discounts.reduce((a, b) => a + b.amount, 0);

                      return (
                        <div className="printer-body">
                          <div className="printer-body-head">
                            <h2>{uppercase(t(receipt ? "receipt" : "order"))}</h2>

                            <div className="printer-head-metadata">
                              <div>
                                <strong>{receipt?.code || order?.code}</strong>
                              </div>
                            </div>
                          </div>

                          <p className="text-smaller time">
                            {t("printed_at")} <strong>{renderDateTime(new Date())}</strong>
                          </p>

                          <table>
                            <thead>
                              <tr>
                                <th className="ta-left">{t("detail")}</th>
                                <th className="ta-right">{t("QTY")}</th>
                                <th className="ta-right">
                                  {printSettings.size === PrintSize.SMALL
                                    ? t("print_total_short")
                                    : t("print_total_long")}
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {order.items.map((item, key) => {
                                const isHidden =
                                  item.price === 0 && !!item.product.isHiddenInReceiptWhenNoPrice;
                                if (isHidden) return null;

                                return (
                                  <tr key={key}>
                                    <td className="ta-left">
                                      {item.product.displayName || item.product.name}
                                    </td>
                                    <td className="ta-right">{num(item.quantity)}</td>
                                    <td className="ta-right">{renderMoney(item.price)}</td>
                                  </tr>
                                );
                              })}

                              {subTotalPrice !== order.totalAmount && (
                                <tr>
                                  <td className="ta-right" colSpan={2}>
                                    {t("subtotal")}
                                  </td>
                                  <td className="ta-right">{renderMoney(subTotalPrice)}</td>
                                </tr>
                              )}

                              {totalDiscount > 0 && (
                                <tr>
                                  <td className="ta-right" colSpan={2} style={{ width: 90 }}>
                                    {t("discount")}
                                  </td>
                                  <td className="ta-right">{renderMoney(totalDiscount)}</td>
                                </tr>
                              )}

                              {!!receipt?.tipAmount && receipt.tipAmount > 0 && (
                                <tr>
                                  <td className="ta-right" colSpan={2}>
                                    TIP
                                  </td>
                                  <td className="ta-right">{renderMoney(receipt.tipAmount)}</td>
                                </tr>
                              )}

                              {order.paidAmount < order.totalAmount && order.paidAmount > 0 ? (
                                <Fragment>
                                  <tr>
                                    <td className="ta-right" colSpan={2}>
                                      {t("payment")}
                                    </td>
                                    <td className="ta-right">
                                      {renderMoney(receipt?.amount || order.totalAmount)}
                                    </td>
                                  </tr>

                                  <tr>
                                    <td className="ta-right" colSpan={2}>
                                      {t("remaining")}
                                    </td>
                                    <td className="ta-right">
                                      <strong>
                                        {renderMoney(order.totalAmount - order.paidAmount)}
                                      </strong>
                                    </td>
                                  </tr>

                                  <tr>
                                    <td className="ta-right" colSpan={2}>
                                      {t("total_short")}
                                    </td>
                                    <td className="ta-right">
                                      <strong>{renderMoney(totalAmount)}</strong>
                                    </td>
                                  </tr>
                                </Fragment>
                              ) : (
                                <Fragment>
                                  <tr>
                                    <td className="ta-right" colSpan={2}>
                                      {t("total_short")}
                                    </td>
                                    <td className="ta-right">
                                      <strong>{renderMoney(totalAmount)}</strong>
                                    </td>
                                  </tr>
                                </Fragment>
                              )}

                              {!!receipt?.giveAmount && (
                                <tr>
                                  <td className="ta-right" colSpan={2}>
                                    {t("money_given_short")}
                                  </td>
                                  <td className="ta-right">{renderMoney(receipt.giveAmount)}</td>
                                </tr>
                              )}
                            </tbody>
                          </table>

                          <div className="printer-metadata ta-center">
                            {order.relatedCustomer && printSettings.showCustomer && (
                              <div>
                                {t("customer")} <br /> <strong>{order.relatedCustomer.name}</strong>
                              </div>
                            )}

                            {receipt?.cashierUser && printSettings.showCashier && (
                              <div>
                                {t("cashier")} <br /> <strong>{receipt.cashierUser.name}</strong>
                              </div>
                            )}
                          </div>

                          {props.bankQrCode && printSettings.showBankQrCode && (
                            <div className="printer-qr-code">
                              <img
                                src={props.bankQrCode.url.replace("compact", "qr_only")}
                                alt=""
                              />
                            </div>
                          )}
                        </div>
                      );
                    }

                    if (props.prescription) {
                      const prescription = props.prescription;
                      const totalDays = prescription.items.reduce((a, b) => Math.max(a, b.days), 0);

                      return (
                        <div className="printer-body">
                          <div className="printer-body-head justify-center">
                            <h1 className="ta-center">{t("prescription_title")}</h1>
                          </div>

                          {customer && (
                            <div className="flex flex-wrap space-between">
                              {customer.name && (
                                <p>
                                  {t("full_name")}: <strong>{customer.name}</strong>
                                </p>
                              )}
                              {customer.birthday && (
                                <p>
                                  {t("birthday")}:{" "}
                                  {new Date(customer.birthday * 1000).getFullYear()}
                                </p>
                              )}
                              {customer.gender && (
                                <p>
                                  {t("gender")}: {renderGener(customer.gender)}
                                </p>
                              )}
                              {customer.location && (
                                <p>
                                  {t("address")}: {renderLocation(customer.location)}
                                </p>
                              )}
                              {prescription.name && (
                                <div className="full-width">
                                  <strong>{prescription.name}</strong>
                                </div>
                              )}
                            </div>
                          )}

                          <table className="bottom-dashed mb-1">
                            <tbody>
                              {prescription.items.map((item, key) => {
                                const total =
                                  ((item.qty.morning || 0) +
                                    (item.qty.noon || 0) +
                                    (item.qty.afternoon || 0)) *
                                  item.days;

                                const renderQty = (qty?: number) => {
                                  if (!qty || qty <= 0) return "--";
                                  return (
                                    <strong>
                                      {num(qty)} {item.unit}
                                    </strong>
                                  );
                                };

                                return (
                                  <tr key={key}>
                                    <td className="ta-left">
                                      <div className="flex column gap-03">
                                        <p>
                                          <strong>
                                            {key + 1}. {item.name}
                                          </strong>
                                        </p>
                                        <div className="flex gap-1">
                                          <p className="text-smaller">
                                            {t("morning")}: {renderQty(item.qty.morning)}
                                          </p>
                                          <p className="text-smaller">
                                            {t("noon")}: {renderQty(item.qty.noon)}
                                          </p>
                                          <p className="text-smaller">
                                            {t("afternoon")}: {renderQty(item.qty.afternoon)}
                                          </p>
                                        </div>

                                        {item.note && (
                                          <p className="text-smaller">
                                            {t("usage")}: <strong>{item.note}</strong>
                                          </p>
                                        )}
                                      </div>
                                    </td>
                                    <td className="ta-left">
                                      <p className="text-smaller ta-right">
                                        <strong>
                                          {num(total)} {item.unit}
                                        </strong>
                                      </p>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>

                          <div className="flex column">
                            <p>
                              {t("days_num")}: <strong>{totalDays}</strong>
                            </p>
                            {!!prescription.note && (
                              <p>
                                {t("advice")}: <strong>{prescription.note}</strong>
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    }
                  })()}

                  {printSettings.showThanks && (
                    <div className="printer-footer">
                      <p className="ta-center">{t("thanks_customer")}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card withBorder shadow="none" p={10}>
              <Group align="center" justify="space-around" gap={16}>
                <Switch
                  label="Logo"
                  defaultChecked={printSettings.showLogo}
                  onChange={(e) => {
                    const _checked = e.target.checked;
                    changePrintSettings({ ...printSettings, showLogo: _checked });
                  }}
                />

                <Switch
                  label={t("address")}
                  defaultChecked={printSettings.showAddress}
                  onChange={(e) => {
                    const _checked = e.target.checked;
                    changePrintSettings({ ...printSettings, showAddress: _checked });
                  }}
                />

                <Switch
                  label={t("cashier")}
                  defaultChecked={printSettings.showCashier}
                  onChange={(e) => {
                    const _checked = e.target.checked;
                    changePrintSettings({ ...printSettings, showCashier: _checked });
                  }}
                />

                <Switch
                  label={t("show_currency")}
                  defaultChecked={printSettings.showCurrency}
                  onChange={(e) => {
                    const _checked = e.target.checked;
                    changePrintSettings({ ...printSettings, showCurrency: _checked });
                  }}
                />

                <Switch
                  label={capitalize(`${t("show")} ${t("customer")}`)}
                  defaultChecked={printSettings.showCustomer}
                  onChange={(e) => {
                    const _checked = e.target.checked;
                    changePrintSettings({ ...printSettings, showCustomer: _checked });
                  }}
                />

                {props.bankQrCode && (
                  <Switch
                    label={t("payment_code")}
                    defaultChecked={printSettings.showBankQrCode}
                    onChange={(e) => {
                      const _checked = e.target.checked;
                      changePrintSettings({ ...printSettings, showBankQrCode: _checked });
                    }}
                  />
                )}

                <Group gap={5} justify="center">
                  <ThemeIcon variant="transparent" color="dark">
                    <IconDimensions size={25} strokeWidth={1.2} />
                  </ThemeIcon>

                  {Object.values(PrintSize).map((_size) => {
                    return (
                      <Button
                        key={_size}
                        variant={_size === printSettings.size ? "filled" : "outline"}
                        color="dark"
                        size="compact-md"
                        fz={em(15)}
                        fw={400}
                        onClick={() => {
                          changePrintSettings({ ...printSettings, size: _size });
                        }}
                      >
                        {t(printSizeLabel(_size))}
                      </Button>
                    );
                  })}
                </Group>
              </Group>
            </Card>

            <Group justify="center" mt={16}>
              <Button
                miw={200}
                onClick={handlePrint}
                type="submit"
                leftSection={<IconPrinter size={18} />}
              >
                {t("quick_print")}
              </Button>
            </Group>

            <Anchor ta="center" onClick={close} fz={12} c="gray">
              {t("exit")}
            </Anchor>
          </Stack>
        );
      })()}
    </Modal>
  );
};

export const PrintButton: FC<PrinterProps> = (props) => {
  const theme = useMantineTheme();

  return (
    <Card p={0} withBorder shadow="none" radius={100} style={{ borderColor: theme.colors.gray[4] }}>
      <Group gap={0} justify="space-around">
        <Tooltip label={t("quick_print")}>
          <Center>
            <Button
              color="gray"
              size="sm"
              variant="transparent"
              onClick={() => OnModalPrinter({ ...props, force: true })}
              leftIcon={IconPrinter}
              fz={13}
            >
              {props.label || t("quick_print")}
            </Button>
          </Center>
        </Tooltip>

        <Divider orientation="vertical" />

        <Tooltip label={t("settings_and_preview")}>
          <ActionIcon
            color="gray"
            w={40}
            variant="transparent"
            onClick={() => OnModalPrinter(props)}
          >
            <IconSettings size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Card>
  );
};
