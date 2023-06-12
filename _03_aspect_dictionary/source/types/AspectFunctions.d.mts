import type {
  IndeterminateClass,
  MethodsOnly,
  VoidMethodsOnly,
} from "#stub_classes/source/types/export-types.mjs";

type PushableArray<T> = ReadonlyArray<T> & Pick<T[], "push">;
type UnshiftableArray<T> = ReadonlyArray<T> & Pick<T[], "push" | "unshift">;

export interface AspectsBuilder<Type extends MethodsOnly>
{
  readonly classInvariants: UnshiftableArray<(new (thisObj: Type) => VoidMethodsOnly<Type>)>;
  readonly bodyComponents: UnshiftableArray<(new (thisObj: Type) => IndeterminateClass<Type>)>;
}

export type GetBuilderType<Type extends MethodsOnly> = (
  _class: Class<Type>
) => AspectsBuilder<Type>;
