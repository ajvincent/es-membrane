import type {
  MethodsOnlyType
} from "#mixin_decorators/source/types/MethodsOnlyType.mjs";

export type PrependArgumentsMethod<
  Type extends MethodsOnlyType,
  Key extends keyof Type,
  IncludeReturnType extends boolean,
  InsertedArguments extends unknown[],
> =
(
  this: Type,
  ...args: [
    ...InsertedArguments,
    ...(true extends IncludeReturnType ? [ReturnType<Type[Key]>] : []),
    ...Parameters<Type[Key]>
  ]
) => ReturnType<Type[Key]>;

export type PrependArgumentsInClass<
  Type extends MethodsOnlyType,
  IncludeReturnType extends boolean,
  InsertedArguments extends unknown[],
> = {
  [Key in keyof Type]: PrependArgumentsMethod<
    Type, Key, IncludeReturnType, InsertedArguments
  >
};
