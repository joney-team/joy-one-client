"use client";

import { Fragment, type ReactNode, useMemo, useRef, useState } from "react";
import { useLayout } from "@/layout/layout-context";
import { useColor } from "@/modules/theme/use-color";
import { t } from "@/modules/lang/lang-service";
import { wait } from "@/utils/common.utils";
import { onError } from "@/utils/exceptions.utils";
import {
  Combobox,
  ComboboxDropdownProps,
  ComboboxProps,
  ComboboxSearchProps,
  ComboboxStore,
  Divider,
  Group,
  InputWrapper,
  InputWrapperProps,
  Loader,
  MantineTheme,
  ScrollArea,
  Text,
  ThemeIcon,
  useCombobox,
  useMantineTheme,
} from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconBackground, IconPlus } from "@tabler/icons-react";

type WithGroup = { _group?: string };
type WithDisabled = { disabled?: boolean };
export type SelectOption = ({ id: string } | { _id: string }) & WithGroup & WithDisabled;

export interface SelectorContext<T extends SelectOption> {
  toggle: () => void;
  close: () => void;
  open: () => void;
  value?: T;
  onChange?: (value?: T) => Promise<void> | void;
  disabled?: boolean;
  theme: MantineTheme;
}

export type SelectorRenderValue<T extends SelectOption> = (ctx: SelectorContext<T>) => ReactNode;
export type SelectorRenderOption<T extends SelectOption> = (item: T) => ReactNode;
export type SelectorOnSearch<T extends SelectOption> = (value: string) => T[] | Promise<T[]>;

export interface SelectorBaseProps<T extends SelectOption>
  extends Omit<InputWrapperProps, "value" | "onSelect" | "onChange"> {
  value?: T;
  onSelect?: (value: T | undefined, ctx: ComboboxStore) => Promise<void> | void;
  onCreate?: (ctx: ComboboxStore) => void;
  initOptions?: T[];
  disabled?: boolean;
  searchPlaceholder?: string;
  onOpen?: () => void;
  onClose?: () => void;
  excludeIds?: string[];
  onSearch?: SelectorOnSearch<T>;
  onInitOptions?: () => T[] | Promise<T[]>;
  staticSearch?: boolean;
  renderOptionChild?: SelectorRenderOption<T>;
  renderOption?: SelectorRenderOption<T>;
  renderTarget: SelectorRenderValue<T>;
  dropdownProps?: ComboboxDropdownProps;
  autoCloseOnChange?: boolean;
  comboboxProps?: ComboboxProps;
  searchProps?: ComboboxSearchProps;
}

export interface SelectorProps<T extends SelectOption = any> extends SelectorBaseProps<T> {}

export const getId = (item: SelectOption): string => ("id" in item ? item.id : item._id);

export const getGroup = (item: WithGroup): string | undefined => item._group;

export function Selector<T extends SelectOption>(props: SelectorProps<T>) {
  const {
    value,
    onSelect,
    onCreate,
    initOptions: propsInitOptions,
    disabled,
    searchPlaceholder,
    onOpen,
    onClose,
    excludeIds,
    onSearch,
    onInitOptions,
    staticSearch,
    renderOptionChild,
    renderOption,
    renderTarget,
    dropdownProps,
    autoCloseOnChange = true,
    comboboxProps,
    searchProps,
    ...rest
  } = props;

  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState("");

  const color = useColor();
  const layout = useLayout();

  const [initOptions, setInitOptions] = useState<T[]>([]);
  const [selectOptions, setSelectOptions] = useState<T[]>([]);

  const searchRef = useRef<HTMLInputElement>(null);
  const theme = useMantineTheme();

  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      if (searchRef.current) searchRef.current.value = "";
    },
  });

  const _initOptions = propsInitOptions || initOptions;

  const options = useMemo(() => {
    let opts = (
      selectOptions.length > 0 || !_initOptions || search.length > 0 ? selectOptions : _initOptions
    ).filter((item) => (props.value ? getId(props.value) !== getId(item) : true));

    if (props.excludeIds) {
      opts = opts.filter((item) => !props.excludeIds?.includes(getId(item)));
    }

    return opts;
  }, [selectOptions, _initOptions, search, props.value, props.excludeIds]);

  const groupOptions = options.reduce((acc, item) => {
    const group = getGroup(item);
    if (group) {
      acc[group] = acc[group] || [];
      acc[group].push(item);
    }
    return acc;
  }, {} as Record<string, T[]>);

  const _onSearch = useDebouncedCallback(
    async (q?: string) => {
      if (!q || q.length < 0) {
        setSelectOptions([]);
        setSearching(false);
        return;
      }

      try {
        setSearching(true);
        const res = await onSearch?.(q);
        setSelectOptions(res || []);
      } catch (error) {
        onError(error);
      } finally {
        setSearching(false);
      }
    },
    props.staticSearch ? 0 : 300
  );

  const _onInitOptions = async () => {
    if (!onInitOptions) return;
    const res = await onInitOptions();
    setInitOptions(res || []);
  };

  const _onOpen = async () => {
    if (props.disabled) return;

    _onInitOptions();
    props.onOpen?.();

    combobox.openDropdown();

    await wait(200);
    searchRef.current?.focus();
  };

  return (
    <InputWrapper
      {...rest}
      styles={{
        ...rest.styles,
        root: {
          display: "flex",
          flexDirection: "column",
          gap: 4,
          ...(rest.styles as any)?.root,
        },
      }}
    >
      <Combobox
        disabled={props.disabled}
        store={combobox}
        onOptionSubmit={async (val) => {
          if (val === "$create") {
            props.onCreate?.(combobox);
            combobox.closeDropdown();
          } else {
            const option = options.find((item) => getId(item) === val);
            await props.onSelect?.(option, combobox);
            if (autoCloseOnChange) combobox.closeDropdown();
          }
        }}
        position="bottom-start"
        shadow="sm"
        offset={3}
        onClose={onClose}
        {...props.comboboxProps}
      >
        <Combobox.Target>
          <Group align="center">
            {props.renderTarget({
              value: props.value,
              disabled: !!props.disabled,
              onChange: (value) => props.onSelect?.(value, combobox),
              open: () => combobox.openDropdown(),
              toggle: () => {
                if (combobox.dropdownOpened) {
                  combobox.closeDropdown();
                  props.onClose?.();
                } else {
                  _onOpen();
                  _onInitOptions();
                }
              },
              close: () => {
                combobox.closeDropdown();
                props.onClose?.();
              },
              theme,
            })}
          </Group>
        </Combobox.Target>

        <Combobox.Dropdown miw={320} {...props.dropdownProps}>
          {!!props.onSearch && (
            <Combobox.Search
              ref={searchRef}
              onChange={(event) => {
                if (search.length === 0 && event.currentTarget.value.length > 0) setSearching(true);
                setSearch(event.currentTarget.value);
                _onSearch(event.currentTarget.value);
              }}
              placeholder={props.searchPlaceholder || t("search")}
              rightSection={
                <Group gap={5} wrap="nowrap">
                  {searching && <Loader size={14} type="dots" color="gray" />}
                </Group>
              }
              {...props.searchProps}
            />
          )}

          <Combobox.Options>
            <ScrollArea.Autosize w="100%" type="scroll" mah={Math.min(400, layout.height * 0.4)}>
              {options.length > 0 ? (
                <Fragment>
                  {options
                    .filter((v) => !getGroup(v))
                    .map((item) => {
                      if (props.renderOption) return props.renderOption(item);
                      if (props.renderOptionChild)
                        return (
                          <Combobox.Option
                            value={getId(item)}
                            key={getId(item)}
                            disabled={item.disabled}
                          >
                            {props.renderOptionChild(item)}
                          </Combobox.Option>
                        );
                    })}

                  {Object.keys(groupOptions).map((group, i) => {
                    return (
                      <Combobox.Group
                        label={group}
                        key={group + i}
                        styles={{ groupLabel: { fontSize: 12 } }}
                      >
                        {groupOptions[group].map((item) => {
                          if (props.renderOption) return props.renderOption(item);
                          if (props.renderOptionChild)
                            return (
                              <Combobox.Option
                                value={getId(item)}
                                key={getId(item)}
                                disabled={item.disabled}
                              >
                                {props.renderOptionChild(item)}
                              </Combobox.Option>
                            );
                        })}
                      </Combobox.Group>
                    );
                  })}
                </Fragment>
              ) : (
                <Fragment>
                  {!searching && (
                    <Combobox.Empty>
                      <Group gap={0} justify="center" flex={1}>
                        <ThemeIcon variant="transparent" color="gray.5">
                          <IconBackground strokeWidth={1.1} size={18} />
                        </ThemeIcon>
                        <Text c="gray.5" fz={12}>
                          {t("type_something_to_search")}
                        </Text>
                      </Group>
                    </Combobox.Empty>
                  )}
                </Fragment>
              )}

              {!!props.onCreate && (
                <Fragment>
                  <Divider my={5} opacity={0.5} />
                  <Combobox.Option value="$create">
                    <Group gap={0} justify="center">
                      <Group w={20} h={16} justify="center" align="center">
                        <IconPlus size={16} color={color("gray.5")} />
                      </Group>

                      <Text fz={12} c="gray.5">
                        {t("create_new")}
                      </Text>
                    </Group>
                  </Combobox.Option>
                </Fragment>
              )}
            </ScrollArea.Autosize>
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </InputWrapper>
  );
}
