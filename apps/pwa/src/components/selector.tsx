"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { useLayout } from "@/layout/layout-context";
import { apiClient } from "@/modules/apis";
import { useColor } from "@/modules/theme/use-color";
import { StorageKey } from "@/constants/storage-key";
import { wait } from "@/utils/common.utils";
import { onError } from "@/utils/exceptions.utils";
import { getId } from "@joy-one-client/utils/base-data";
import { Trans, useLingui } from "@lingui/react/macro";
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
import { useList } from "./list/use-list";

type WithGroup = { _group?: string };
type WithDisabled = { disabled?: boolean };
export type SelectOption = ({ id: string } | { _id: string }) & WithGroup & WithDisabled;

export interface SelectorContext<T extends SelectOption> {
  toggle: () => void;
  close: () => void;
  open: () => void;
  value?: T | null;
  onChange?: (value?: T | null) => Promise<void> | void;
  disabled?: boolean;
  theme: MantineTheme;
}

export type SelectorTarget<T extends SelectOption> = (ctx: SelectorContext<T>) => ReactNode;
export type SelectorRenderOption<T extends SelectOption> = (item: T, key: string) => ReactNode;
export type SelectorOnSearch<T extends SelectOption> = (value: string) => T[] | Promise<T[]>;

export interface SelectorBaseProps<T extends SelectOption>
  extends Omit<InputWrapperProps, "value" | "onSelect" | "onChange"> {
  listRoute?: string;
  listParams?: Record<string, any>;
  value?: T | null | undefined;
  onSelect?: (value: T | null | undefined, ctx: ComboboxStore) => Promise<any> | any;
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
  getOptionId?: (item: T) => string;
}

export interface SelectorProps<T extends SelectOption = any> extends SelectorBaseProps<T> {}

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
    getOptionId: propsGetOptionId,
    ...rest
  } = props;

  const getOptionId = propsGetOptionId ?? getId;

  const [workspaceId] = useLocalStorage(StorageKey.WORKSPACE_ID);
  const { t } = useLingui();

  const isListable = listRoute && listRoute.length > 0;
  const list = useList<T>({
    autoFetch: false,
    isSkip: !isListable,
    id: `sopts${listRoute}${JSON.stringify(listParams)}${workspaceId}`,
    fetch: async (p) => {
      if (!listRoute || listRoute.length === 0) {
        return { data: [], count: 0 };
      }

      return apiClient.get(listRoute!, {
        params: {
          sortLastInteractionAt: -1,
          ...listParams,
          ...p,
        },
      });
    },
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
      value: getOptionId(v),
      data: v,
    }));

    const pinnedOptions = (propsPinnedOptions || [])
      .filter((v) => !listOptions.find((listOption) => getOptionId(v) === getOptionId(listOption)))
      .map((v) => ({
        ...v,
        label: getLabel(v),
        value: getOptionId(v),
        data: v,
      }));

    const combinedOptions = (
      searchOptions.length > 0 || search.length > 0
        ? searchOptions
        : [...pinnedOptions, ...listOptions]
    )
      .filter((item) => (value ? getOptionId(value) !== getOptionId(item) : true))
      .filter((item) => {
        if (excludeIds) {
          return !excludeIds?.includes(getOptionId(item));
        }
        return true;
      });

    return [...combinedOptions];
  }, [searchOptions, search, value, excludeIds, propsPinnedOptions, list.data]);

  const groupOptions = options.reduce((acc, item) => {
    const group = getGroup(item);
    if (group) {
      acc[group] = acc[group] || [];
      acc[group].push(item);
    }
    return acc;
  }, {} as Record<string, T[]>);

  const handleSearch = useDebouncedCallback(
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

  const handleOpen = async () => {
    if (props.disabled) return;

    props.onOpen?.();
    combobox.openDropdown();
    list.fetch(true, { isSilient: true });

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
        shadow="sm"
        offset={4}
        onClose={onClose}
        onOptionSubmit={async (val) => {
          if (val === "$create") {
            props.onCreate?.(combobox);
            combobox.closeDropdown();
          } else {
            const option =
              options.find((item) => getOptionId(item) === val) ||
              list.data.find((item) => getOptionId(item) === val);

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
                  handleOpen();
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
                handleSearch(event.currentTarget.value);
              }}
              placeholder={props.searchPlaceholder || t`Search`}
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
              scrollbars="y"
              mah={Math.min(400, layout.height * 0.4)}
              viewportRef={dropdownRef}
              onScrollPositionChange={onScrollPositionChange}
            >
              {options.length > 0 ? (
                <Fragment>
                  {options
                    .filter((v) => !getGroup(v))
                    .map((item, itemIndex) => props.renderOption(item, `option-${itemIndex}`))}

                  {Object.keys(groupOptions).map((group, groupIndex) => {
                    if (groupOptions[group].length === 0) return null;

                    return (
                      <Combobox.Group
                        label={group}
                        key={group + groupIndex}
                        styles={{ groupLabel: { fontSize: 12 } }}
                      >
                        {groupOptions[group].map((item, itemIndex) =>
                          props.renderOption(item, `group-${groupIndex}-option-${itemIndex}`)
                        )}
                      </Combobox.Group>
                    );
                  })}
                </Fragment>
              ) : (
                <Combobox.Empty>
                  <Group gap={0} justify="center" flex={1}>
                    <ThemeIcon variant="transparent" color="gray.5">
                      <IconBackground strokeWidth={1.1} size={18} />
                    </ThemeIcon>
                    <Text c="gray.5" fz={12}>
                      {searching ? (
                        <Trans>Type something to search</Trans>
                      ) : (
                        <Trans>No results</Trans>
                      )}
                    </Text>
                  </Group>
                </Combobox.Empty>
              )}

              {isListable && list.isFetching && (
                <Center>
                  <Loader size={14} type="dots" color="gray" />
                </Center>
              )}

              {!!props.onCreate && (
                <Fragment>
                  {options.length > 0 && <Divider my={5} opacity={0.5} />}
                  <Combobox.Option value="$create">
                    <Group gap={0} justify="center">
                      <Group w={20} h={16} justify="center" align="center">
                        <IconPlus size={16} color={color("gray.5")} />
                      </Group>

                      <Text fz={12} c="gray.5">
                        <Trans>Create new</Trans>
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
