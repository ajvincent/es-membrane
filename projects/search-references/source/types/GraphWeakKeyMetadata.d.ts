import type {
  JsonObject
} from "type-fest";

import type {
  BuiltInJSTypeName,
} from "../utilities/constants.js";

export interface GraphWeakKeyMetadata extends JsonObject {
  readonly builtInJSTypeName: BuiltInJSTypeName;
  readonly derivedClassName: string;
  classSpecifier: string | null;
  classLineNumber: number | null;
  symbolDescription: string | null;
}
