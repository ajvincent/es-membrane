const OBJECT_OR_SYMBOL_TYPES = new Set(["symbol", "object", "function"]);
export default function isObjectOrSymbol(
  value: unknown
): value is (object | symbol)
{
  return OBJECT_OR_SYMBOL_TYPES.has(typeof value);
}
