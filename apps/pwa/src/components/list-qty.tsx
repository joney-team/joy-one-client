import { num, t } from "@/modules/lang/lang-service";
import { UseList } from "@/utils/use-list.util";
import { Badge, em } from "@mantine/core";
import { FC } from "react";

export interface ListQtyProps<T = any> {
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
