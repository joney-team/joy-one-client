import type { CodegenConfig } from "@graphql-codegen/cli";

const codeGenConfig: CodegenConfig = {
  schema: "./src/graphql/schema.graphql",
  generates: {
    "src/graphql/types.graphql.d.ts": {
      plugins: ["typescript"],
      config: {
        useTypeImports: true,
        enumsAsConst: true,
        nonOptionalTypename: true,
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
      plugins: ["typescript-operations", "./codegen-default-export.js"],
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
