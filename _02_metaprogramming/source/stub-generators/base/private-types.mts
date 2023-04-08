import type {
  OptionalKind,
  MethodSignatureStructure,
  ParameterDeclarationStructure
} from "ts-morph";

export type TS_Method = OptionalKind<MethodSignatureStructure>;
export type TS_Parameter = OptionalKind<ParameterDeclarationStructure>;

