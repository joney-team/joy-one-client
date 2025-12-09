import { useApolloClient } from "@apollo/client/react";
import { DocumentNode } from "graphql";
import { useCallback, useEffect, useRef, useState } from "react";

type UseFragmentParams = {
  id: string;
  fragment: DocumentNode;
  fragmentName?: string;
  skip?: boolean;
};

type UseFragmentReturn<T> = [T | null, (data: Partial<T>) => void, () => void];

export function useFragment<T = any>({
  id,
  fragment,
  fragmentName,
  skip = false,
}: UseFragmentParams): UseFragmentReturn<T> {
  const client = useApolloClient();
  const [data, setDataState] = useState<T | null>(null);
  const fragmentRef = useRef(fragment);
  const fragmentNameRef = useRef(fragmentName);

  // Update refs when fragment or fragmentName changes
  useEffect(() => {
    fragmentRef.current = fragment;
    fragmentNameRef.current = fragmentName;
  }, [fragment, fragmentName]);

  // Read fragment from cache
  const readFragment = useCallback((): T | null => {
    if (!id || skip) return null;

    try {
      const result = client.cache.readFragment<T>({
        id,
        fragment: fragmentRef.current,
        fragmentName: fragmentNameRef.current,
      });
      return result ?? null;
    } catch (error) {
      // Fragment might not exist in cache yet
      console.warn(`Failed to read fragment for id ${id}:`, error);
      return null;
    }
  }, [client, id, skip]);

  // Refresh data from cache
  const refresh = useCallback(() => {
    if (!id || skip) return;
    const updated = readFragment();
    setDataState(updated);
  }, [id, skip, readFragment]);

  // Write fragment to cache
  const setData = useCallback(
    (updated: Partial<T>) => {
      if (!id || skip) return;

      try {
        // Read current data from cache first
        const currentData = readFragment();

        if (currentData === null) {
          console.warn(`Cannot write fragment: data not found in cache for id ${id}`);
          return;
        }

        // Merge with updated data
        const mergedData = {
          ...currentData,
          ...updated,
        };

        client.cache.writeFragment({
          id,
          fragment: fragmentRef.current,
          fragmentName: fragmentNameRef.current,
          data: mergedData,
        });

        // Update local state after writing
        setDataState(mergedData as T);
      } catch (error) {
        console.error(`Failed to write fragment for id ${id}:`, error);
      }
    },
    [client, id, readFragment, skip]
  );

  useEffect(() => {
    if (!id || skip) {
      setDataState(null);
      return;
    }

    // Read initial data
    const initial = readFragment();
    setDataState(initial);
  }, [id, skip, readFragment]);

  return [data, setData, refresh];
}
