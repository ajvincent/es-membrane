import { CodeBlockWriter, WriterFunction } from "ts-morph";
import {
  type ClassDeclarationImpl,
  FunctionDeclarationImpl,
  LiteralTypeStructureImpl,
  ParameterDeclarationImpl,
  PrefixOperatorsTypeStructureImpl,
  TypeArgumentedTypeStructureImpl,
} from "ts-morph-structures";

const decoratorFunction = new FunctionDeclarationImpl;
decoratorFunction.isDefaultExport = true;

const baseClassParam = new ParameterDeclarationImpl("baseClass");
baseClassParam.typeStructure = new PrefixOperatorsTypeStructureImpl(
  ["typeof"],
  LiteralTypeStructureImpl.get("ObjectGraphTailHandler")
);

decoratorFunction.returnTypeStructure = baseClassParam.typeStructure;

const contextParam = new ParameterDeclarationImpl("context");
contextParam.typeStructure = LiteralTypeStructureImpl.get("ClassDecoratorContext");

decoratorFunction.parameters.push(baseClassParam, contextParam);

export default function buildTailDecoratorFunction(): FunctionDeclarationImpl
{
  return FunctionDeclarationImpl.clone(decoratorFunction);
}

const SatisfiesTypeArgumented = new TypeArgumentedTypeStructureImpl(
  LiteralTypeStructureImpl.get("ClassDecoratorFunction"),
  [
    baseClassParam.typeStructure,
    LiteralTypeStructureImpl.get("true"),
    LiteralTypeStructureImpl.get("false")
  ]
);

export function tailSatisfiesStatement(
  classDecl: ClassDeclarationImpl
): WriterFunction
{
  return (writer: CodeBlockWriter): void => {
    writer.write(classDecl.name!);
    writer.write(" satisfies ");
    SatisfiesTypeArgumented.writerFunction(writer);
    writer.writeLine(";");
  }
}
