import type {
  MethodsOnlyType
} from "#aspects/stubs/source/types/MethodsOnlyType.mjs";

export type BodyTrapTypesBase<This extends MethodsOnlyType> = {
  [Key in keyof This]: object
}
