import type {
  BuiltInJSTypeName,
} from "../../utilities/constants.js";

import type {
  GraphWeakKeyMetadata
} from "../../types/GraphWeakKeyMetadata.js";

export function buildObjectMetadata(
  builtInJSTypeName: BuiltInJSTypeName,
  derivedClassName: string,
): GraphWeakKeyMetadata
{
  return {
    builtInJSTypeName,
    derivedClassName,
    classSpecifier: null,
    classLineNumber: null,
    symbolDescription: null,
  };
}
