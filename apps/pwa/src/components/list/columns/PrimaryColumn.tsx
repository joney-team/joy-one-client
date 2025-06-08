import { Clickable } from "@/components/clickable";
import { Column } from "../types";

type ValidRoute<Data> = `/${string}/:${string & keyof Data}` | `/${string}/:${string & keyof Data}/${string}`;

export interface PrimaryColumn<Data = any> extends Omit<Column<Data>, "render"> {
  route: ValidRoute<Data>;
}

export function PrimaryColumn<Data = any>(args?: PrimaryColumn<Data>): Column<Data> {
  return {
    ...(args ?? {}),
    render: ({ value, data }) => {
      const fieldName = args?.route.split("/").pop()?.replace(":", "");
      const href = args?.route.replace(`:${fieldName}`, data[fieldName as keyof Data] as string);
      return <Clickable href={href}>{value}</Clickable>;
    },
  };
}
