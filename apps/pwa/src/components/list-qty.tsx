"use client";

import type { BaseData } from "@joy-one-client/utils/base-data";
import { Trans } from "@lingui/react/macro";
import { FC } from "react";
import { Badge } from "./badge";
import { NumberFormat } from "./format/number-format";
import { UseList } from "./list/use-rest-list";

export interface ListQtyProps<T extends BaseData = any> {
  list: UseList<T>;
}

export const ListQty: FC<ListQtyProps> = (props) => {
  return (
    <Badge variant="light" size="xl" fz="xs" style={{ borderRadius: 100 }}>
      <Trans>QTY</Trans>
      {": "}
      {props.list.isInitialized && <NumberFormat value={props.list.count} />}
    </Badge>
  );
};
