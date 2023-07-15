import { SourceFile } from "ts-morph";

import type {
  //TS_Method,
  TS_Parameter
} from "./ts-morph-native.mjs";

import type {
  ParamRenamer
} from "./paramRenamer.mjs";

import {
  type MiddleParamBuilder as TransitionsEntryMidBuilder,
  type TailParamBuilder as TransitionsEntryTailBuilder,
} from "../types/paramBuilders.mjs";

export type StubClassSetConfiguration = Readonly<{
  /** the source file containing the interface or type alias. */
  sourceFile: SourceFile,

  /** the name of the interface or type alias. */
  interfaceOrAliasName: string,

  /** The directory where all stubs will live. */
  destinationDir: string,

  /** The base class name.  Actual stubs may append a stub-descriptive name. */
  className: string,

  /** Where the interface-or-type-alias file lives. */
  pathToTypeFile: string,

  /** True if pathToTypeFile is an absolute path. */
  isTypeFilePackage: boolean,

  /** parameter definitions which aren't necessarily based on the original arguments. */
  middleParameters: readonly TS_Parameter[],

  /** "Tail" class stub specific settings.  */
  transitionsTail: {
    /** Give me a new name for wrapping an existing parameter. */
    paramRenamer: ParamRenamer,

    /** constructor argument types for the class. */
    classArgumentTypes: string,
  },

  /** "Head" class stub specific settings. */
  transitionsHead: Readonly<{
    /** A type alias name to use for the middle parameter types. */
    midParamsTypeAlias: string,

    /** The middle parameters builder. */
    midBuilder: TransitionsEntryMidBuilder,

    /** The tail parameters builder. */
    tailBuilder: TransitionsEntryTailBuilder,
  }>;
}>;
