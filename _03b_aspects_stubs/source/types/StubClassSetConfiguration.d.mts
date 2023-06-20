import { SourceFile } from "ts-morph";

/*
import type {
  TS_Method,
  TS_Parameter
} from "./types/export-types.mjs";

import type {
  ParamRenamer
} from "./transitions/types/paramRenamer.mjs";

import {
  type MiddleParamBuilder as TransitionsEntryMidBuilder,
  type TailParamBuilder as TransitionsEntryTailBuilder,
} from "./transitions/decorators/headCall.mjs";
*/

export type StubClassSetConfiguration = Readonly<{
  sourceFile: SourceFile,
  interfaceOrAliasName: string,
  destinationDir: string,
  className: string,
  pathToTypeFile: string,
  isTypeFilePackage: boolean,

  /*
  middleParameters: ReadonlyArray<TS_Parameter>;
  tailParamRenamer: ParamRenamer;

  transitionsHead: Readonly<{
    midParamsTypeAlias: string;
    midBuilder: TransitionsEntryMidBuilder,
    tailBuilder: TransitionsEntryTailBuilder,
  }>;

  transitionsMiddle: Readonly<{
    buildMethodBody(this: ConfigureStub, structure: TS_Method, remainingArgs: Set<TS_Parameter>): void;
  }>;
  */
}>;
