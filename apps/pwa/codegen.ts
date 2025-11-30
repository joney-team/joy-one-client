import type { CodegenConfig } from "@graphql-codegen/cli";

const codeGenConfig: CodegenConfig = {
  schema: "./src/graphql/schema.graphql",
  generates: {
    "src/graphql/types.graphql.d.ts": {
      plugins: ["typescript"],
      config: {
        useTypeImports: true,
        enumsAsConst: true,
        avoidOptionals: {
          field: true,
          object: false,
          inputValue: false,
          defaultValue: false,
        },
      },
    },
    "src/graphql/enums.graphql.ts": {
      plugins: ["typescript"],
      config: {
        onlyEnums: true,
        enumsAsConst: true,
      },
    },
    "src/": {
      preset: "near-operation-file",
      presetConfig: {
        extension: ".graphql.d.ts",
        baseTypesPath: "graphql/types.graphql.d.ts",
      },
      documents: ["src/**/*.graphql"],
      plugins: [
        "typescript-operations",
        {
          add: {
            placement: "append",
            content:
              'declare const Document: import("graphql").DocumentNode; export default Document;',
          },
        },
      ],
      config: {
        avoidOptionals: {
          field: true,
          object: false,
          inputValue: false,
          defaultValue: false,
        },
        useTypeImports: true,
        nonOptionalTypename: true,
        arrayInputCoercion: false,
      },
    },
  },
};
export default codeGenConfig;
