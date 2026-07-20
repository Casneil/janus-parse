import eslintJs from "@eslint/js";
import { defineConfig } from "eslint/config";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import { importX, createNodeResolver } from "eslint-plugin-import-x";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import tsEslint from "typescript-eslint";

export default defineConfig([
  {
    ignores: [
      "**/dist/**",
      "fixtures/**",
      "public/**",
      "node_modules/**",
      "pnpm-lock.yaml",
    ],
  },

  eslintJs.configs.recommended,
  ...tsEslint.configs.recommended,
  ...tsEslint.configs.stylistic,
  importX.flatConfigs.recommended,
  eslintPluginUnicorn.configs.recommended,
  {
    rules: {
      "@typescript-eslint/consistent-type-definitions": ["warn", "type"],
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      // Registers the TypeScript and Node resolvers natively inside import-x
      "import-x/resolver-next": [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
        }),
        createNodeResolver(),
      ],
      // Fallback fallback namespace if rules use the "import/" prefix instead of "import-x/"
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    plugins: {
      import: importX,
    },
    rules: {
      "unicorn/prevent-abbreviations": "off",
      "unicorn/prefer-string-replace-all": "off",
      "unicorn/prefer-module": "off",
      "unicorn/no-abusive-eslint-disable": "off",
      "unicorn/no-useless-undefined": "off",
      "unicorn/filename-case": [
        "error",
        {
          case: "kebabCase",
        },
      ],
      "import/no-commonjs": [
        "error",
        {
          allowConditionalRequire: false,
          allowPrimitiveModules: false,
        },
      ],
      "import/no-import-module-exports": "error",
      "import/no-default-export": "error",
      "import/no-useless-path-segments": "error",
      "import/consistent-type-specifier-style": ["warn", "prefer-top-level"],
      "import/first": "warn",
      "import/newline-after-import": "warn",
      "import/order": [
        "error",
        {
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
          pathGroupsExcludedImportTypes: [],
          groups: [
            "builtin",
            "external",
            ["internal", "sibling", "parent", "index"],
          ],
        },
      ],
      "func-style": [
        "error",
        "declaration",
        {
          allowArrowFunctions: false,
        },
      ],
    },
  },
  {
    files: ["eslint.config.mjs", "vitest.config.ts"],
    rules: {
      "import/no-default-export": "off",
    },
  },
]);
