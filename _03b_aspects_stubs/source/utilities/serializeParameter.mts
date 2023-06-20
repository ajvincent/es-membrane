import { TS_Parameter } from "../types/ts-morph-native.mjs";
import extractType from "./extractType.mjs";

/**
 * Serialize a TypeScript parameter to a string.
 */
export default function serializeParameter(param: TS_Parameter): string {
  let rv = param.name;
  const typeData = param.type ? extractType(param.type, true) : undefined;
  if (typeData)
    rv += ": " + typeData;
  return rv;
}
