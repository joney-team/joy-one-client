"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { useLayout } from "@/layout/layout-context";
import { api } from "@/modules/apis";
import { t } from "@/modules/lang/lang-service";
import { useColor } from "@/modules/theme/use-color";
import { StorageKey } from "@/types";
import { wait } from "@/utils/common.utils";
import { onError } from "@/utils/exceptions.utils";
import { useList } from "@/utils/use-list.util";
import {
  Center,
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
import { Fragment, type ReactNode, useMemo, useRef, useState } from "react";

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

export type SelectorTarget<T extends SelectOption> = (ctx: SelectorContext<T>) => ReactNode;
export type SelectorRenderOption<T extends SelectOption> = (item: T) => ReactNode;
export type SelectorOnSearch<T extends SelectOption> = (value: string) => T[] | Promise<T[]>;

export interface SelectorBaseProps<T extends SelectOption>
  extends Omit<InputWrapperProps, "value" | "onSelect" | "onChange"> {
  listRoute?: string;
  listParams?: Record<string, any>;
  value?: T;
  onSelect?: (value: T | undefined, ctx: ComboboxStore) => Promise<any> | any;
  onCreate?: (ctx: ComboboxStore) => void;
  pinnedOptions?: T[];
  disabled?: boolean;
  searchPlaceholder?: string;
  onOpen?: () => void;
  onClose?: () => void;
  excludeIds?: string[];
  onSearch?: SelectorOnSearch<T>;
  staticSearch?: boolean;
  renderOption: SelectorRenderOption<T>;
  target: SelectorTarget<T>;
  dropdownProps?: ComboboxDropdownProps;
  autoCloseOnChange?: boolean;
  comboboxProps?: ComboboxProps;
  searchProps?: ComboboxSearchProps;
}

export interface SelectorProps<T extends SelectOption = any> extends SelectorBaseProps<T> {}

export const getId = (item: SelectOption): string => ("id" in item ? item.id : item._id);

export const getLabel = (item: any): string =>
  "label" in item ? item.label : "name" in item ? item.name : getId(item);

export const getGroup = (item: WithGroup): string | undefined => item._group;

export function Selector<T extends SelectOption>(props: SelectorProps<T>) {
  const {
    value,
    onSelect,
    onCreate,
    pinnedOptions: propsPinnedOptions,
    disabled,
    searchPlaceholder,
    onOpen,
    onClose,
    excludeIds,
    onSearch,
    staticSearch,
    renderOption,
    target: renderTarget,
    dropdownProps,
    autoCloseOnChange = true,
    comboboxProps,
    searchProps,
    listRoute,
    listParams,
    ...rest
  } = props;

  const [workspaceId] = useLocalStorage(StorageKey.WORKSPACE_ID);
  const isListable = listRoute && listRoute.length > 0;
  const list = useList<T>({
    isSkip: !isListable,
    id: `sopts${listRoute}${JSON.stringify(listParams)}${workspaceId}`,
    fetch: async (p) =>
      api.get(listRoute!, {
        params: {
          sortLastInteractionAt: -1,
          ...listParams,
          ...p,
        },
      }),
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState("");

  const color = useColor();
  const layout = useLayout();

  const [searchOptions, setSearchOptions] = useState<T[]>([]);

  const searchRef = useRef<HTMLInputElement>(null);
  const theme = useMantineTheme();

  const combobox = useCombobox({
    onDropdownClose: () => {
      combobox.resetSelectedOption();
      if (searchRef.current) searchRef.current.value = "";
    },
  });

  const options = useMemo(() => {
    const listOptions = [...list.data].map((v) => ({
      ...v,
      label: getLabel(v),
      value: getId(v),
      data: v,
    }));

    const pinnedOptions = (propsPinnedOptions || [])
      .filter((v) => !listOptions.find((v2) => getId(v) === getId(v2)))
      .map((v) => ({
        ...v,
        label: getLabel(v),
        value: getId(v),
        data: v,
      }));

    const opts = (
      searchOptions.length > 0 || search.length > 0
        ? searchOptions
        : [...pinnedOptions, ...listOptions]
    )
      .filter((item) => (value ? getId(value) !== getId(item) : true))
      .filter((item) => {
        if (excludeIds) {
          return !excludeIds?.includes(getId(item));
        }
        return true;
      });

    return [...opts];
  }, [searchOptions, search, value, excludeIds, propsPinnedOptions, list.data]);

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
        setSearchOptions([]);
        setSearching(false);
        return;
      }

      try {
        setSearching(true);
        const res = await onSearch?.(q);
        setSearchOptions(res || []);
      } catch (error) {
        onError(error);
      } finally {
        setSearching(false);
      }
    },
    props.staticSearch ? 0 : 300
  );

  const _onOpen = async () => {
    if (props.disabled) return;

    props.onOpen?.();

    combobox.openDropdown();

    await wait(200);
    searchRef.current?.focus();
  };

  const onScrollPositionChange = (pos: { x: number; y: number }) => {
    if (!dropdownRef.current || !list.isAbleToLoadMore || !isListable) return;
    const scrollHeight = dropdownRef.current.scrollHeight;
    const isNearBottom = pos.y >= scrollHeight - 400;
    if (isNearBottom) {
      list.loadMore();
    }
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
        disabled={disabled}
        store={combobox}
        position="bottom-start"
        shadow="sm"
        offset={3}
        onClose={onClose}
        onOptionSubmit={async (val) => {
          if (val === "$create") {
            props.onCreate?.(combobox);
            combobox.closeDropdown();
          } else {
            const option =
              options.find((item) => getId(item) === val) ||
              list.data.find((item) => getId(item) === val);

            await props.onSelect?.(option, combobox);
            if (autoCloseOnChange) combobox.closeDropdown();
          }
        }}
        {...comboboxProps}
      >
        <Combobox.Target>
          <Group align="center">
            {renderTarget({
              value,
              disabled: !!disabled,
              onChange: (value) => onSelect?.(value, combobox),
              open: () => combobox.openDropdown(),
              toggle: () => {
                if (combobox.dropdownOpened) {
                  combobox.closeDropdown();
                  onClose?.();
                } else {
                  _onOpen();
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
            <ScrollArea.Autosize
              w="100%"
              type="scroll"
              mah={Math.min(400, layout.height * 0.4)}
              viewportRef={dropdownRef}
              onScrollPositionChange={onScrollPositionChange}
            >
              {options.length > 0 ? (
                <Fragment>
                  {options.filter((v) => !getGroup(v)).map((item) => props.renderOption(item))}

                  {Object.keys(groupOptions).map((group, i) => {
                    if (groupOptions[group].length === 0) return null;

                    return (
                      <Combobox.Group
                        label={group}
                        key={group + i}
                        styles={{ groupLabel: { fontSize: 12 } }}
                      >
                        {groupOptions[group].map((item) => props.renderOption(item))}
                      </Combobox.Group>
                    );
                  })}
                </Fragment>
              ) : (
                <Fragment>
                  {!searching && !listRoute && (
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

              {isListable && list.isFetching && (
                <Center>
                  <Loader size={14} type="dots" color="gray" />
                </Center>
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
