"use client";

import { useLayout } from "@/layout/layout-context";
import { useOrderFeatureName } from "@/modules/orders/order-hooks";
import { wait } from "@/utils/common.utils";
import { onError } from "@/utils/exceptions.utils";
import { Anchor, Card, Group, Modal, Skeleton, Stack } from "@mantine/core";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import { IconPrinter } from "@tabler/icons-react";
import { Fragment, useEffect, useMemo, useRef, useState, type FC } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "../buttons/button";
import { ModalTitle } from "../modal-title";
import { PrinterHeader } from "./printer-header";
import { PrinterComponentProps, PrinterProps, PrinterSettings, PrintSize } from "./printer-types";

import { classNames } from "@/utils/ui.utils";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { PrinterBody } from "./printer-body";
import { PrinterSettingsBar, printerSizeClasses } from "./printer-settings-bar";
import styles from "./printer.module.css";

export const Printer: FC<PrinterProps> = (props) => {
  const layout = useLayout();
  const orderFeatureName = useOrderFeatureName();

  const [isLoading, setIsLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);

  const [qrCodeLink, setQrCodeLink] = useState<string | null>(null);
  const [settings, setSettings] = useLocalStorage<PrinterSettings>({
    key: "printer-settings",
    defaultValue: {
      size: PrintSize.MEDIUM,
      showLogo: true,
      showBankQrCode: true,
      showAddress: true,
      showCashier: true,
      showCurrency: true,
      showCustomer: true,
      autoTrigger: false,
    },
  });

  const printTitle = useMemo(() => {
    const entity = "props.receipt" in props ? t`Receipt` : t`Order`;
    return t`Print ${entity}`;
  }, [props, orderFeatureName]);

  const printerClass = classNames(styles.Printer, styles[settings.size]);

  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef,
    bodyClass: printerClass,
    onAfterPrint: () => {
      close();
    },
    onPrintError: (error) => {
      onError(error);
      close();
    },
  });

  const initialize = async () => {
    setIsLoading(true);
    setQrCodeLink(null);
    try {
      await wait(300);
    } catch (error) {
      onError(error);
      close();
    } finally {
      setIsLoading(false);
    }
  };

  const componentProps: PrinterComponentProps = {
    ...props,
    settings,
    qrCodeLink,
  };

  useEffect(() => {
    initialize();
  }, [props]);

  return (
    <Fragment>
      <Group justify="center" align="center" onClick={open}>
        {typeof props.children === "function" ? props.children({ open, close }) : props.children}
      </Group>

      <Modal
        opened={opened}
        onClose={close}
        title={<ModalTitle title={printTitle} icon={IconPrinter} />}
        fullScreen={layout.view === "mobile"}
        size="xl"
      >
        {(function () {
          if (!opened) return null;
          if (isLoading) return <Skeleton height={100} />;

          return (
            <Stack align="center">
              <Card
                withBorder
                shadow="none"
                p={5}
                w={printerSizeClasses[settings.size].width}
                maw="100%"
              >
                <div ref={contentRef} className={printerClass}>
                  <div className={styles.PrinterWrapper}>
                    <PrinterHeader {...componentProps} />
                    <PrinterBody {...componentProps} />
                  </div>
                </div>
              </Card>

              <Card withBorder shadow="none">
                <PrinterSettingsBar
                  setSettings={(s) => setSettings({ ...settings, ...s })}
                  {...componentProps}
                />
              </Card>

              <Stack gap={12}>
                <Group justify="center" mt={16}>
                  <Button miw={150} onClick={handlePrint} leftIcon={IconPrinter}>
                    <Trans>Print</Trans>
                  </Button>
                </Group>

                <Anchor ta="center" onClick={close} fz={12} c="gray">
                  <Trans>Exit</Trans>
                </Anchor>
              </Stack>
            </Stack>
          );
        })()}
      </Modal>
    </Fragment>
  );
};
