import type {
  OptionalKind,
  MethodSignatureStructure,
  ParameterDeclarationStructure
} from "ts-morph";

type TS_Method = OptionalKind<MethodSignatureStructure>;
type TS_Parameter = OptionalKind<ParameterDeclarationStructure>;

import type {
  MethodsOnly
} from "../base/types/MethodsOnly.mjs";
import type {
  IndeterminateClass
} from "../base/types/IndeterminateClass.mjs";

import type {
  NotImplementedOnly
} from "../base/types/NotImplementedOnly.mjs";
import type {
  MethodsPrependReturn
} from "../base/types/MethodsPrependReturn.mjs";
import type {
  MethodReturnRewrite
} from "../base/types/MethodReturnRewrite.mjs";
import type {
  TransitionInterface
} from "../transitions/types/TransitionInterface.mjs";
import type {
  VoidMethodsOnly
} from "../base/types/VoidMethodsOnly.mjs";
import type {
  ConfigureStubDecorator
} from "../base/types/ConfigureStubDecorator.mjs";

export type {
  MethodsOnly,
  IndeterminateClass,
  NotImplementedOnly,
  MethodsPrependReturn,
  MethodReturnRewrite,
  TransitionInterface,
  VoidMethodsOnly,
  TS_Method,
  TS_Parameter,
  ConfigureStubDecorator,
}
