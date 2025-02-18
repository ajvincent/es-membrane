import type {
  InternalSlotAnalyzer
} from "../types/InternalSlotAnalyzer.js";

import {
  InternalSlotTypesEnum
} from "./InternalSlotTypesEnum.js";

import * as allSlotAnalyzers from "./allSlotAnalyzers.js";

const slotAnalyzerMap = new Map<InternalSlotTypesEnum, InternalSlotAnalyzer>;
for (const analyzer of Object.values(allSlotAnalyzers)) {
  analyzer.registerSlotHandler(slotAnalyzerMap);
}

export const InternalSlotAnalyzerMap: ReadonlyMap<
  InternalSlotTypesEnum, InternalSlotAnalyzer
> = slotAnalyzerMap;
