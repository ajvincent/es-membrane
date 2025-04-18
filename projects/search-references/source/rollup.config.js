import pkg from 'typescript';
const { ModuleKind, ModuleResolutionKind, ScriptTarget } = pkg;

import ts_plugin from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

const compilerOptions = {
  "lib": ["lib.es2023.d.ts"],
  "module": ModuleKind.ES2022,
  "target": ScriptTarget.ES2022,
  "moduleResolution": ModuleResolutionKind.Bundler,

  "baseUrl": ".",

  "strict": true,
  "esModuleInterop": true,
  "skipLibCheck": true,
  "forceConsistentCasingInFileNames": true,
};

const RollupOptions = [
  {
    input: "./host-exports.ts",
    output: {
      file: "../dist/host/exports.js",
      format: "es",
    },
    external: [
      "@dagrejs/graphlib",
      "@engine262/engine262",
      "import-meta-resolve",
      "node:fs",
      "node:url",
      "type-fest",
    ],
    plugins: [
      ts_plugin(
        {
          "compilerOptions": {...compilerOptions},
        }
      ),
    ],
  },

  {
    input: "./host-exports.ts",
    output: {
      file: "../dist/host/exports.d.ts",
      format: "es"
    },
    external: [
      "@dagrejs/graphlib",
      "@engine262/engine262",
      "import-meta-resolve",
      "node:fs",
      "node:url",
      "type-fest",
    ],
    plugins: [
      dts(
        {
          "compilerOptions": {...compilerOptions},
        }
      ),
    ],
  },
];

export default RollupOptions;
