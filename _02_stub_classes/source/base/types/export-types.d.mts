import type {
  OptionalKind,
  MethodSignatureStructure,
  ParameterDeclarationStructure
} from "ts-morph";

type TS_Method = OptionalKind<MethodSignatureStructure>;
type TS_Parameter = OptionalKind<ParameterDeclarationStructure>;

import type {
  MethodsOnly
} from "./MethodsOnly.mjs";
import type {
  IndeterminateClass
} from "./IndeterminateClass.mjs";

import type {
  NotImplementedOnly
} from "./NotImplementedOnly.mjs";
import type {
  MethodsPrependReturn
} from "./MethodsPrependReturn.mjs";
import type {
  MethodReturnRewrite
} from "./MethodReturnRewrite.mjs";
import type {
  TransitionInterface
} from "../../transitions/types/TransitionInterface.mjs";
import type {
  VoidMethodsOnly
} from "./VoidMethodsOnly.mjs";
import type {
  ConfigureStubDecorator
} from "./ConfigureStubDecorator.mjs";

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
