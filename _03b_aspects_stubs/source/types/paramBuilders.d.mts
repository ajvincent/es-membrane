import type {
  ReadonlyDeep
} from "type-fest";

import AspectsStubBase from "../AspectsStubBase.mts";

import type {
  TS_Method,
  TS_Parameter
} from "./ts-morph-native.mjs";

export type MiddleParamBuilder = (
  this: AspectsStubBase,
  methodStructure: ReadonlyDeep<TS_Method>,
  structure: ReadonlyDeep<TS_Parameter>,
) => void;

export type TailParamBuilder = (
  this: AspectsStubBase,
  methodStructure: ReadonlyDeep<TS_Method>,
  structure: ReadonlyDeep<TS_Parameter>,
  newParameterName: string,
) => void;
