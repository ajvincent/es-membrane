import {
  FalseLiteral,
  LiteralExpression,
  LiteralTypeNode,
  NumericLiteral,
  StringLiteral,
  TrueLiteral,
  TypeFlags,
  TypeNode,
} from "ts-morph"

import {
  LiteralTypedStructureImpl,
  StringTypedStructureImpl,
  type TypeStructure
} from "../../exports.mjs"

export default function convertTypeNode(
  typeNode: TypeNode
): TypeStructure | null
{
  const type = typeNode.getType();
  const flags = type.getFlags();
  if (type.isAny())
    return new LiteralTypedStructureImpl("any");
  if (type.isNever())
    return new LiteralTypedStructureImpl("never");
  if (type.isBoolean())
    return new LiteralTypedStructureImpl("boolean");
  if (type.isString())
    return new LiteralTypedStructureImpl("string");
  if (type.isNumber())
    return new LiteralTypedStructureImpl("number");
  if (type.isUnknown())
    return new LiteralTypedStructureImpl("unknown");
  if (type.isNull())
    return new LiteralTypedStructureImpl("null");
  if (type.isUndefined())
    return new LiteralTypedStructureImpl("undefined");
  if (type.isVoid())
    return new LiteralTypedStructureImpl("void");
  if (type.isLiteral()) {
    const literal = (typeNode as LiteralTypeNode).getLiteral()
    if (literal instanceof TrueLiteral)
      return new LiteralTypedStructureImpl("true");
    if (literal instanceof FalseLiteral)
      return new LiteralTypedStructureImpl("false");
    if (literal instanceof StringLiteral)
      return new StringTypedStructureImpl(literal.getLiteralText());
    if (literal instanceof LiteralExpression)
      return new LiteralTypedStructureImpl(literal.getLiteralText());
    if (literal instanceof NumericLiteral)
      return new LiteralTypedStructureImpl(literal.getLiteralText());
  }

  if (flags & TypeFlags.ESSymbol)
    return new LiteralTypedStructureImpl("symbol");

  return null;
}
