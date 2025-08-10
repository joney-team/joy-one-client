"use client";

import { num, t } from "@/modules/lang/lang-service";
import { UseList } from "@/components/list/use-list";
import { Badge, em } from "@mantine/core";
import { FC } from "react";
import { BaseData } from "./list/types";

export interface ListQtyProps<T extends BaseData = any> {
  list: UseList<T>;
}

export const ListQty: FC<ListQtyProps> = (props) => {
  return (
    <Badge variant="light" size="xl" fz={em(12)} style={{ borderRadius: 100 }}>
      {t("qty")}
      {props.list.isInitialized && `: ${num(props.list.count)}`}
    </Badge>
  );
};
