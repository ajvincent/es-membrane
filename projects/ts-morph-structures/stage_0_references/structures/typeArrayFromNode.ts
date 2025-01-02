import {
  CodeBlockWriter,
  type InterfaceDeclarationStructure,
  type TypeAliasDeclarationStructure,
  WriterFunction,
} from "ts-morph";

export function typeArrayFromInterface(
  s: InterfaceDeclarationStructure
) : readonly string[]
{
  const extendsArray = s.extends;
  if (!extendsArray)
    throw new Error(`undefined extends for interface ${s.name}`);

  let types: readonly string[];
  if (!Array.isArray(extendsArray)) {
    types = [resolveCodeBlock(extendsArray)];
  }
  else {
    types = extendsArray.map(resolveCodeBlock);
  }

  return types.map(parseDependencies);
}

export function typeArrayFromAlias(
  s: TypeAliasDeclarationStructure
) : readonly string[]
{
  const types = resolveCodeBlock(s.type).split("|");
  return types.map(parseDependencies);
}

export function resolveCodeBlock(
  s: string | WriterFunction | undefined
) : string
{
  if (typeof s === "undefined")
    return "";
  if (typeof s === "string")
    return s;

  const writer = new CodeBlockWriter;
  s(writer);
  return writer.toString();
}

function parseDependencies(
  dep: string
) : string
{
  return dep.trim().replace(/<.*/, "");
}
