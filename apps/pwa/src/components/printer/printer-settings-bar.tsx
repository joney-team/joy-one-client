"use client";

import { t } from "@lingui/core/macro";
import { Button, Group, SimpleGrid, Stack, Switch, ThemeIcon } from "@mantine/core";
import { IconDimensions } from "@tabler/icons-react";
import { type FC } from "react";
import { PrinterComponentProps, PrinterSettings, PrintSize } from "./printer-types";

export const printerSizeClasses: Record<
  PrintSize,
  {
    label: () => string;
    width: number;
  }
> = {
  [PrintSize.SMALL]: { label: () => t`Small`, width: 200 },
  [PrintSize.MEDIUM]: { label: () => t`Medium`, width: 300 },
  [PrintSize.LARGE]: { label: () => t`Large`, width: 800 },
};

type PrinterSettingsBarProps = PrinterComponentProps & {
  setSettings: (settings: Partial<PrinterSettings>) => void;
};

export const PrinterSettingsBar: FC<PrinterSettingsBarProps> = ({ settings, setSettings }) => {
  return (
    <Stack>
      <SimpleGrid cols={4}>
        <Switch
          label="Logo"
          defaultChecked={settings.showLogo}
          onChange={(e) => {
            const _checked = e.target.checked;
            setSettings({ showLogo: _checked });
          }}
        />

        <Switch
          label={t`Address`}
          defaultChecked={settings.showAddress}
          onChange={(e) => {
            const _checked = e.target.checked;
            setSettings({ showAddress: _checked });
          }}
        />

        <Switch
          label={t`Cashier`}
          defaultChecked={settings.showCashier}
          onChange={(e) => {
            const _checked = e.target.checked;
            setSettings({ showCashier: _checked });
          }}
        />

        <Switch
          label={t`Show currency`}
          defaultChecked={settings.showCurrency}
          onChange={(e) => {
            const _checked = e.target.checked;
            setSettings({ showCurrency: _checked });
          }}
        />

        <Switch
          label={t`Customer`}
          defaultChecked={settings.showCustomer}
          onChange={(e) => {
            const _checked = e.target.checked;
            setSettings({ showCustomer: _checked });
          }}
        />

        <Switch
          label={t`Auto`}
          defaultChecked={settings.autoTrigger}
          onChange={(e) => {
            const _checked = e.target.checked;
            setSettings({ autoTrigger: _checked });
          }}
        />

        <Switch
          label={t`Payment code`}
          defaultChecked={settings.showBankQrCode}
          onChange={(e) => {
            const _checked = e.target.checked;
            setSettings({ showBankQrCode: _checked });
          }}
        />
      </SimpleGrid>

      <Group gap={5} justify="center">
        <ThemeIcon variant="transparent" color="dark">
          <IconDimensions size={25} strokeWidth={1.2} />
        </ThemeIcon>

        {Object.values(PrintSize).map((_size) => {
          return (
            <Button
              key={_size}
              variant={_size === settings.size ? "filled" : "outline"}
              color="dark"
              size="compact-md"
              fz={15}
              fw={400}
              onClick={() => setSettings({ size: _size })}
            >
              {printerSizeClasses[_size].label()}
            </Button>
          );
        })}
      </Group>
    </Stack>
  );
};
