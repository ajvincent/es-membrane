import type {
  MethodsOnly,
  VoidMethodsOnly,
} from "#stub_classes/source/base/types/export-types.mjs";

/**
 * The aspect-oriented types we're trying to use.
 */
export type AspectsDictionary<T extends MethodsOnly> = {
  classInvariant: ReadonlyArray<VoidMethodsOnly<T>>;
  /*
  precondition: ReadonlyArray<VoidMethodsOnly<T>>;
  checkArguments: ReadonlyArray<VoidMethodsOnly<T>>;
  bodyAssert: ReadonlyArray<VoidMethodsOnly<T>>;
  checkReturn: ReadonlyArray<VoidMethodsOnly<T>>;
  postcondition: ReadonlyArray<VoidMethodsOnly<T>>;
  */
};
