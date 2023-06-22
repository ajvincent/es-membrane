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
  sourceFile: SourceFile,
  interfaceOrAliasName: string,
  destinationDir: string,
  className: string,
  pathToTypeFile: string,
  isTypeFilePackage: boolean,

  middleParameters: ReadonlyArray<TS_Parameter>;

  transitionsTail: {
    paramRenamer: ParamRenamer,
    classArgumentTypes: string,
  },

  transitionsHead: Readonly<{
    midParamsTypeAlias: string;
    midBuilder: TransitionsEntryMidBuilder,
    tailBuilder: TransitionsEntryTailBuilder,
  }>;
}>;
