import {
  VariableDeclarationKind,
} from "ts-morph";

import {
  type TypeStructures,
  VariableStatementImpl,
  VariableDeclarationImpl,
  type stringOrWriterFunction,
} from "ts-morph-structures";

/** `const ${variableName}: ${typeStructure} = ${initializer};` */
export default function buildConstStatement(
  variableName: string,
  typeStructure: TypeStructures,
  initializer: stringOrWriterFunction,
): VariableStatementImpl
{
  const statement = new VariableStatementImpl();
  statement.declarationKind = VariableDeclarationKind.Const;

  const declaration = new VariableDeclarationImpl(variableName);
  declaration.typeStructure = typeStructure;
  declaration.initializer = initializer;

  statement.declarations.push(declaration);
  return statement;
}
