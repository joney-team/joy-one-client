import { Clickable } from "@/components/clickable";
import { Column } from "../types";

type ValidRoute<Data> =
  | `/${string}/:${string & keyof Data}`
  | `/${string}/:${string & keyof Data}/${string}`;

export interface primaryColumn<Data = any> extends Omit<Column<Data>, "render"> {
  route: ValidRoute<Data>;
}

export function primaryColumn<Data = any>(args?: primaryColumn<Data>): Column<Data> {
  return {
    ...(args ?? {}),
    render: ({ value, data }) => {
      let href = args?.route || "";

      Object.entries(data as Record<string, any>).forEach(([key, value]) => {
        if (href?.includes(`:${key}`)) {
          href = href.replace(`:${key}`, value as string);
        }
      });

      return <Clickable href={href}>{value}</Clickable>;
    },
  };
}
