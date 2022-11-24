//import ts from "ts-morph";

import type { NumberStringType } from "./NumberStringType.mjs";
import type { ComponentPassThroughClass } from "../source/exports/PassThroughSupport.mjs";

//import type { TypeToClassCallback } from "../../_04a_ts-morph_utilities/source/TypeToClass.mjs";

export type NumberStringComponent = ComponentPassThroughClass<NumberStringType, NumberStringType>;
