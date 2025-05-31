import type {
  JsonObject
} from "type-fest";

import type {
  BuiltInJSTypeName,
} from "../utilities/constants.js";

export interface GraphObjectMetadata extends JsonObject {
  readonly builtInJSTypeName: BuiltInJSTypeName;
  readonly derivedClassName: string;
  classSpecifier?: string;
  classLineNumber?: number;
}
