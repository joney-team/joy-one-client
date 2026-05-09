import config from "@joy-one/config";

import type { CodegenConfig } from "@graphql-codegen/cli";

const codegenConfig: CodegenConfig = {
  schema: `${config.API_CLIENT_SIDE_URL}/graphql`,
  generates: {
    "src/graphql/schema.graphql": {
      plugins: ["schema-ast"],
    },
  },
};

export default codegenConfig;
