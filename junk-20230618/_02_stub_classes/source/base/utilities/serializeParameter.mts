import { TS_Parameter } from "../../types/export-types.mjs";
import extractType from "./extractType.mjs";

export default function serializeParameter(param: TS_Parameter): string {
  let rv = param.name;
  const typeData = param.type ? extractType(param.type, true) : undefined;
  if (typeData)
    rv += ": " + typeData;
  return rv;
}
