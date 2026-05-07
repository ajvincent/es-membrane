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

const sharedCoreOptions = {
  input: "./core-host-exports.ts",
  external: [
    "@dagrejs/graphlib",
    "@engine262/engine262",
  ],
};

const RollupOptions = [
  {
    ...sharedCoreOptions,
    output: {
      file: "../dist/core-host/runSearchesInGuestEngine.js",
      format: "es",
    },
    plugins: [
      ts_plugin(
        {
          "compilerOptions": {...compilerOptions},
        }
      ),
    ],
  },

  {
    ...sharedCoreOptions,
    output: {
      file: "../dist/core-host/runSearchesInGuestEngine.d.ts",
      format: "es"
    },
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
