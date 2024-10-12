// #region preamble

import type {
  MethodsOnlyType
} from "./MethodsOnlyType.mts";

import type {
  AddImport
} from "./AddImport.d.mts";

import type {
  TS_Parameter,
  TS_TypeParameter,
} from "./ts-morph-native.d.mts";

// #endregion preamble

/**
 * @privateRemarks
 *
 * Consider rebuilding this around ts.DecoratorSpecificStructure?  This is more specific, though.
 */
export type MethodDecoratorDescription = {
  readonly decoratorName: string,
  readonly typeParameters: readonly TS_TypeParameter[] | null,
  readonly parameters: readonly TS_Parameter[] | null,
};

export type MethodDecoratorsOfClass<Type extends MethodsOnlyType> = {
  readonly importsToAdd: readonly AddImport[],
  readonly methods: Record<keyof Type, readonly MethodDecoratorDescription[]>;
};
