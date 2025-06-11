import { getTaskMetadata } from "@/modules/tasks/tasks-service";
import { combineMetadata } from "@/utils/metadata.utils";
import { Fragment } from "react";

export const generateMetadata = combineMetadata({
  fetch: async ({ params }) => getTaskMetadata(params.code as string),
});

export default () => <Fragment />;
