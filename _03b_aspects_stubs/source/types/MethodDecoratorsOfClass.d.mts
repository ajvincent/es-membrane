// #region preamble

import type {
  MethodsOnly
} from "./MethodsOnly.mjs";

import type {
  AddImport
} from "./AddImport.mjs";

import type {
  TS_Parameter
} from "./ts-morph-native.mjs";

// #endregion preamble

export type MethodDecoratorDescription = {
  readonly decoratorName: string,
  readonly parameters: ReadonlyArray<TS_Parameter> | null,
};

export type MethodDecoratorsOfClass<Type extends object> =
  MethodsOnly<Type> extends object ?
  {
    readonly importsToAdd: ReadonlyArray<AddImport>,
    readonly methods: {
      readonly [key: keyof Type]: ReadonlyArray<MethodDecoratorDescription>;
    }
  } :
  never;
