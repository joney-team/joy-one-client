"use client";

import { classNames } from "@/utils/ui.utils";
import { Card, Group, Loader, Stack, Text, ThemeIcon } from "@mantine/core";

import { Avatar } from "@/components/avatar";
import { appEntities } from "@/constant";
import { AppEntity } from "@/types";
import { useQuery } from "@apollo/client/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useClickOutside } from "@mantine/hooks";
import { IconCreditCardPay, IconStack2 } from "@tabler/icons-react";
import type { Editor } from "@tiptap/react";
import { forwardRef, Fragment, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { MentionAttributes } from "./editor-mention-types";
import styles from "./editor-mention.module.css";
import SearchDocument, { SearchQuery } from "@/modules/search/graphql/search.graphql";

export interface MentionListProps {
  command: (option: MentionAttributes) => void;
  editor?: Editor;
  query: string;
}

export interface MentionListRef {
  onKeyDown: (args: { event: KeyboardEvent }) => void;
}

const MentionListItem = ({
  result,
  isSelected,
  onClick,
}: {
  result: SearchQuery["search"][number];
  isSelected: boolean;
  onClick: () => void;
}) => {
  if (result.__typename === "SearchResultWorkspaceMember") {
    return (
      <Group
        className={classNames(styles.MentionListItem, {
          [styles.isSelected]: isSelected,
        })}
        gap="xs"
        pr="sm"
        pl="xs"
        py={5}
        align="center"
        onClick={onClick}
      >
        <Avatar user={result} size={20} />
        <Text fz="sm">{result.name}</Text>
      </Group>
    );
  }

  if (result.__typename === "SearchResultCustomer") {
    return (
      <Group
        className={classNames(styles.MentionListItem, {
          [styles.isSelected]: isSelected,
        })}
        gap="xs"
        pr="sm"
        pl="xs"
        py={5}
        align="center"
        onClick={onClick}
      >
        <Avatar customer={result} size={20} />
        <Text fz="sm">{result.name}</Text>
      </Group>
    );
  }

  if (result.__typename === "SearchResultLoan") {
    return (
      <Group
        className={classNames(styles.MentionListItem, {
          [styles.isSelected]: isSelected,
        })}
        gap="xs"
        pr="sm"
        pl="xs"
        py={5}
        align="center"
        onClick={onClick}
      >
        <ThemeIcon color="gray" size="xs" radius={5}>
          <IconCreditCardPay size={12} />
        </ThemeIcon>
        <Stack gap={0}>
          <Text fz={9} c="gray" fw={500}>
            {result.loanCode}
          </Text>
          <Text fz="sm">{result.customerName}</Text>
        </Stack>
      </Group>
    );
  }

  if (result.__typename === "SearchResultTask") {
    return (
      <Group
        className={classNames(styles.MentionListItem, {
          [styles.isSelected]: isSelected,
        })}
        gap="xs"
        pr="sm"
        pl="xs"
        py={5}
        align="center"
        onClick={onClick}
      >
        <ThemeIcon color="gray" size="xs" radius={5}>
          <IconStack2 size={12} />
        </ThemeIcon>
        <Stack gap={0}>
          <Text fz={9} c="gray" fw={500}>
            {result.taskCode}
          </Text>
          <Text fz="sm" maw={200} truncate>
            {result.name}
          </Text>
        </Stack>
      </Group>
    );
  }

  return null;
};

export const MentionList = forwardRef<MentionListRef, MentionListProps>((props, ref) => {
  const textSearch = props.query;
  const { t } = useLingui();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const refClickOutside = useClickOutside(() => setIsHidden(true));

  const { data: searchResult, loading: isSearchLoading } = useQuery(SearchDocument, {
    variables: {
      query: textSearch,
      limit: 5,
      entities: [
        AppEntity.WORKSPACE_MEMBERS,
        AppEntity.LOANS,
        AppEntity.TASKS,
        AppEntity.CUSTOMERS,
      ],
    },
    skip: !textSearch || textSearch.length === 0,
    fetchPolicy: "cache-and-network",
  });

  const selectItem = (index: number) => {
    const item = searchResult?.search?.[index];
    if (!item) return;

    if (item.__typename === "SearchResultWorkspaceMember") {
      return props.command({ id: item.userId, entity: AppEntity.USERS });
    }

    if (item.__typename === "SearchResultLoan") {
      return props.command({ id: item.id, entity: AppEntity.LOANS });
    }

    if (item.__typename === "SearchResultTask") {
      return props.command({ id: item.id, entity: AppEntity.TASKS });
    }

    if (item.__typename === "SearchResultCustomer") {
      return props.command({ id: item.id, entity: AppEntity.CUSTOMERS });
    }
  };

  const upHandler = () => {
    if (!searchResult) return;
    setSelectedIndex((selectedIndex + searchResult.search.length - 1) % searchResult.search.length);
  };

  const downHandler = () => {
    if (!searchResult) return;
    setSelectedIndex((selectedIndex + 1) % searchResult.search.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }

      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }

      if (event.key === "Enter") {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  useEffect(() => setSelectedIndex(0), [searchResult]);

  useEffect(() => {
    const onScroll = () => {
      setIsHidden(true);
    };

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    try {
      const element = props.editor?.options.element as HTMLDivElement;

      const onClick = () => {
        setIsHidden(false);
      };

      element?.addEventListener("click", onClick);

      return () => {
        element?.removeEventListener("click", onClick);
      };
    } catch (error) {
      console.error(error);
    }
  }, []);

  const isSearchEmpty = useMemo(() => {
    return !searchResult || searchResult.search.length === 0;
  }, [searchResult]);

  if (!textSearch || textSearch.length === 0 || isSearchEmpty || isHidden) {
    return null;
  }

  const searchResultList = Array.from(searchResult?.search ?? []);

  return (
    <Card
      withBorder
      className={styles.EditorMentionList}
      p={0}
      style={{ overflow: "hidden" }}
      ref={refClickOutside}
    >
      <Stack gap={0} pb={5}>
        {isSearchLoading && <Loader size="xs" type="dots" color="gray" />}

        {searchResultList.map((result, resultIndex) => {
          const prevResult = searchResultList[resultIndex - 1];
          const entity = appEntities[result.entity as AppEntity];
          if (!entity) return null;

          return (
            <Fragment key={result.id}>
              {(!prevResult || prevResult.entity !== result.entity) && (
                <Text
                  fz="xs"
                  c="gray"
                  py={2}
                  px={5}
                  w="100%"
                  bg="gray.0"
                  style={{
                    marginTop: !prevResult ? 0 : 5,
                    marginBottom: 5,
                  }}
                >
                  {t(entity.name)}
                </Text>
              )}

              <Stack px={5}>
                <MentionListItem
                  result={result}
                  isSelected={resultIndex === selectedIndex}
                  onClick={() => selectItem(resultIndex)}
                />
              </Stack>
            </Fragment>
          );
        })}

        {isSearchEmpty && (
          <Text fz="sm" c="gray" ta="center" px="xs">
            <Trans>No results found</Trans>
          </Text>
        )}
      </Stack>
    </Card>
  );
});
