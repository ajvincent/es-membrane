import type {
  ReadonlyDeep
} from "type-fest";

import AspectsStubBase from "../AspectsStubBase.mts";

import type {
  TS_Method,
  TS_Parameter,
} from "./ts-morph-native.d.mts";

/**
 * Build a new "middle" parameter for a transitions-head class.
 * @param this - providing direct access to `this.classWriter` for writing the parameter definition.
 * @param methodStructure - the method owning this parameter.
 * @param structure - the middle parameter basic structure.
 */
export type MiddleParamBuilder = (
  this: AspectsStubBase,
  methodStructure: ReadonlyDeep<TS_Method>,
  structure: ReadonlyDeep<TS_Parameter>,
) => void;

/**
 * Build a new "tail" parameter for a transitions-head class.
 * @param this - providing direct access to `this.classWriter` for writing the parameter definition.
 * @param methodStructure - the method owning this parameter.
 * @param structure - the middle parameter basic structure.
 * @param newParameterName - the tail parameter's name.
 */
export type TailParamBuilder = (
  this: AspectsStubBase,
  methodStructure: ReadonlyDeep<TS_Method>,
  structure: ReadonlyDeep<TS_Parameter>,
  newParameterName: string,
) => void;
