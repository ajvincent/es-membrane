import type {
  OptionalKind,
  MethodSignatureStructure,
  ParameterDeclarationStructure,
  TypeParameterDeclarationStructure,
} from "ts-morph";

type TS_Method = OptionalKind<MethodSignatureStructure>;
type TS_Parameter = OptionalKind<ParameterDeclarationStructure>;
type TS_TypeParameter = OptionalKind<TypeParameterDeclarationStructure>;
