import type {
  BuiltInJSTypeName,
} from "../../utilities/constants.js";

import type {
  GraphObjectMetadata
} from "../../types/GraphObjectMetadata.js";

export function buildObjectMetadata(
  builtInJSTypeName: BuiltInJSTypeName,
  derivedClassName: string,
): GraphObjectMetadata
{
  return {
    builtInJSTypeName,
    derivedClassName
  };
}
