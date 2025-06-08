import { Skeleton } from "@mantine/core";
import { Suspense } from "react";
import { List as ListComponent } from "./list";
import { ListProps } from "./types";

export function List<T = any>(props: ListProps<T>) {
  return (
    <Suspense fallback={<Skeleton height={500} />}>
      <ListComponent {...props} />
    </Suspense>
  );
}
