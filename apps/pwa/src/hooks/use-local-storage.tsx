"use client";

import { StorageKey } from "@/types";
import { isServer } from "@/utils/common.utils";
import { readLocalStorageValue, useLocalStorage as useMantineLocalStorage } from "@mantine/hooks";

export const useLocalStorage = (key: StorageKey, defaultValue?: string | undefined) => {
  return useMantineLocalStorage<string | undefined>({
    key: key.toString(),
    defaultValue: !isServer()
      ? localStorage?.getItem(key)?.replace(/"/g, "") || defaultValue
      : defaultValue,
  });
};

export const getLocalStorage = (key: StorageKey): string | null => {
  return readLocalStorageValue({ key: key.toString() }) ?? null;
};
