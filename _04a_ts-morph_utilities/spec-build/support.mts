import ts from "ts-morph";

import path from "path";
import url from "url";

const parentDir = path.resolve(url.fileURLToPath(import.meta.url), "../..");

import TypeToClass, {
  FieldDeclaration,
  InterfaceOrTypeAlias,
} from "../source/TypeToClass.mjs";
import { PromiseAllParallel } from "../../_01_stage_utilities/source/PromiseTypes.mjs";

export default async function() : Promise<void>
{
  const project = new ts.Project({
    compilerOptions: {
      lib: ["es2022"],
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ES2022,
      moduleResolution: ts.ModuleResolutionKind.Node16,
      sourceMap: true,
      declaration: true,
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
    }
  });

  const fixturesDir = project.addDirectoryAtPath(path.join(parentDir, "fixtures"));
  const generatedDir = project.addDirectoryAtPath(path.join(parentDir, "spec-generated"));

  await PromiseAllParallel([
    buildNumberStringTypeClass,
    buildNumberStringInterfaceClass,
    buildIsTypedNST,
    buildNumberStringWithTypeClass,
    buildPartialType,
    buildStringNumberTypeClass,
    buildIsTypedNSTWithConstructor,
    buildNumberStringAndTypeClass,
    throwNumberStringOrBar,
    buildFooExtendsNumberStringClass,
    buildNumberStringAndIllegalClass,
    buildUnionArgumentClass,
    buildNumberStringExcludesBarClass,
    buildNST_Keys,
    buildNumberStringConditionalClass,
    buildNumberStringAndSymbolClass,

    buildSpyClass,
  ], callback => callback(fixturesDir, generatedDir));
}

async function buildNumberStringTypeClass(
  fixturesDir: ts.Directory,
  generatedDir: ts.Directory
) : Promise<void>
{
  const srcFile = fixturesDir.addSourceFileAtPath("NumberStringType.mts");
  const destFile = generatedDir.createSourceFile("NumberStringTypeClass.mts");

  const TTC = new TypeToClass(
    destFile,
    "NumberStringTypeClass",
    TypeToClass.notImplementedCallback
  );

  TTC.addTypeAliasOrInterface(
    srcFile,
    "NumberStringType",
  );

  await destFile.save();
}

async function buildNumberStringInterfaceClass(
  fixturesDir: ts.Directory,
  generatedDir: ts.Directory
) : Promise<void>
{
  const srcFile = fixturesDir.addSourceFileAtPath("NumberStringInterface.mts");
  const destFile = generatedDir.createSourceFile("NumberStringInterfaceClass.mts");

  const TTC = new TypeToClass(
    destFile,
    "NumberStringInterfaceClass",
    TypeToClass.notImplementedCallback
  );

  TTC.addTypeAliasOrInterface(
    srcFile,
    "NumberStringInterface",
  );

  await destFile.save();
}

async function buildIsTypedNST(
  fixturesDir: ts.Directory,
  generatedDir: ts.Directory
) : Promise<void>
{
  return await buildSingleTypePattern(fixturesDir, generatedDir, "IsTypedNST.mts", "IsTypedNST");
}

async function buildNumberStringWithTypeClass(
  fixturesDir: ts.Directory,
  generatedDir: ts.Directory
) : Promise<void>
{
  let srcFile = fixturesDir.addSourceFileAtPath("NumberStringType.mts");
  const destFile = generatedDir.createSourceFile("NumberStringWithTypeClass.mts");

  const TTC = new TypeToClass(
    destFile,
    "NumberStringTypeClass",
    TypeToClass.notImplementedCallback
  );

  TTC.addTypeAliasOrInterface(
    srcFile,
    "NumberStringType",
  );

  srcFile = fixturesDir.addSourceFileAtPath("TypePatterns.mts");
  TTC.addTypeAliasOrInterface(
    srcFile,
    "IsTypedNST"
  );

  await destFile.save();
}

async function buildPartialType(
  fixturesDir: ts.Directory,
  generatedDir: ts.Directory
) : Promise<void>
{
  const srcFile = fixturesDir.addSourceFileAtPath("NumberStringType.mts");
  const destFile = generatedDir.createSourceFile("NumberStringPartial.mts");

  const TTC = new TypeToClass(
    destFile,
    "PartialType",

    function(
      classNode: ts.ClassDeclaration,
      propertyName: string,
      propertyNode: FieldDeclaration,
      baseNode: InterfaceOrTypeAlias,
    ) : boolean
    {
      if (propertyName === "repeatBack")
        return false;
      return TypeToClass.notImplementedCallback(classNode, propertyName, propertyNode, baseNode);
    }
  );

  TTC.addTypeAliasOrInterface(
    srcFile,
    "NumberStringType",
  );

  await destFile.save();
}

async function buildStringNumberTypeClass(
  fixturesDir: ts.Directory,
  generatedDir: ts.Directory
) : Promise<void>
{
  await buildSingleTypePattern(
    fixturesDir,
    generatedDir,
    "StringNumberTypeClass.mts",
    "StringNumberType"
  );
}

async function buildIsTypedNSTWithConstructor(
  fixturesDir: ts.Directory,
  generatedDir: ts.Directory
) : Promise<void>
{
  const srcFile = fixturesDir.addSourceFileAtPath("TypePatterns.mts");
  const destFile = generatedDir.createSourceFile("IsTypedNSTWithConstructor.mts");

  const TTC = new TypeToClass(
    destFile,
    "HasTypeString",
    (
      classNode: ts.ClassDeclaration,
      propertyName: string,
      propertyNode: FieldDeclaration,
      baseNode: InterfaceOrTypeAlias,
    ) : boolean =>
    {
      if (ts.Node.isMethodDeclaration(propertyNode)) {
        return TypeToClass.notImplementedCallback(
          classNode,
          propertyName,
          propertyNode,
          baseNode
        );
      }

      const ctors = classNode.getConstructors();
      let targetCtor: ts.ConstructorDeclaration;
      if (!ctors.length) {
        targetCtor = classNode.addConstructor();
      }
      else {
        targetCtor = ctors[0];
      }

      if (propertyName !== "type")
        throw new Error("unexpected property name: " + propertyName.toString());

      const returnType = propertyNode.getTypeNodeOrThrow().getText();
      if (returnType !== "string")
        throw new Error("unexpected property type: " + returnType);

      targetCtor.addStatements(`this.type = "foo";`);
      return true;
    }
  );

  TTC.addTypeAliasOrInterface(
    srcFile,
    "IsTypedNST",
  );

  await destFile.save();
}

async function buildNumberStringAndTypeClass(
  fixturesDir: ts.Directory,
  generatedDir: ts.Directory
) : Promise<void>
{
  await buildSingleTypePattern(
    fixturesDir,
    generatedDir,
    "NumberStringAndTypeClass.mts",
    "NumberStringAndType"
  );
}

async function throwNumberStringOrBar(
  fixturesDir: ts.Directory,
  generatedDir: ts.Directory
) : Promise<void>
{
  const srcFile = fixturesDir.addSourceFileAtPath("TypePatterns.mts");
  const destFile = generatedDir.createSourceFile("NumberStringOrBarClass.mts");

  const TTC = new TypeToClass(
    destFile,
    "NumberStringTypeClass",
    TypeToClass.notImplementedCallback
  );

  let pass = false;
  try {
    TTC.addTypeAliasOrInterface(
      srcFile,
      "NumberStringOrBar",
    );
  }
  catch (ex: unknown) {
    if ((ex as Error).message !== "You cannot add a type which is a union of two or more types!  (How should I know which type to support?)")
      throw ex;
    pass = true;
  }

  if (!pass)
    throw new Error("Expected exception for NumberStringOrType, but none was thrown!");

  await destFile.delete();
}

async function buildFooExtendsNumberStringClass(
  fixturesDir: ts.Directory,
  generatedDir: ts.Directory
) : Promise<void>
{
  await buildSingleTypePattern(
    fixturesDir,
    generatedDir,
    "FooExtendsNumberString.mts",
    "NumberStringFoo"
  );
}

async function buildNumberStringAndIllegalClass(
  fixturesDir: ts.Directory,
  generatedDir: ts.Directory
) : Promise<void>
{
  await buildSingleTypePattern(
    fixturesDir,
    generatedDir,
    "NumberStringAndIllegal.mts",
    "NumberStringAndIllegal"
  );
}

async function buildUnionArgumentClass(
  fixturesDir: ts.Directory,
  generatedDir: ts.Directory
) : Promise<void>
{
  await buildSingleTypePattern(
    fixturesDir,
    generatedDir,
    "UnionArgumentClass.mts",
    "UnionArgument"
  );
}

async function buildNumberStringExcludesBarClass(
  fixturesDir: ts.Directory,
  generatedDir: ts.Directory
) : Promise<void>
{
  await buildSingleTypePattern(
    fixturesDir,
    generatedDir,
    "NumberStringExcludesBarClass.mts",
    "NumberStringExcludesBar"
  );
}

async function buildNST_Keys(
  fixturesDir: ts.Directory,
  generatedDir: ts.Directory
) : Promise<void>
{
  await buildSingleTypePattern(
    fixturesDir,
    generatedDir,
    "NST_Keys_Class.mts",
    "NST_Keys"
  );
}

async function buildNumberStringConditionalClass(
  fixturesDir: ts.Directory,
  generatedDir: ts.Directory
) : Promise<void>
{
  await buildSingleTypePattern(
    fixturesDir,
    generatedDir,
    "NumberStringConditionalClass.mts",
    "NumberStringConditional"
  );
}

async function buildNumberStringAndSymbolClass(
  fixturesDir: ts.Directory,
  generatedDir: ts.Directory
) : Promise<void>
{
  await buildSingleTypePattern(
    fixturesDir,
    generatedDir,
    "NumberStringAndSymbolClass.mts",
    "NumberStringAndSymbol"
  );
}

async function buildSingleTypePattern(
  fixturesDir: ts.Directory,
  generatedDir: ts.Directory,
  fileName: string,
  typeName: string
) : Promise<void>
{
  const srcFile = fixturesDir.addSourceFileAtPath("TypePatterns.mts");
  const destFile = generatedDir.createSourceFile(fileName);

  const TTC = new TypeToClass(
    destFile,
    "NumberStringClass",
    TypeToClass.notImplementedCallback
  );

  TTC.addTypeAliasOrInterface(
    srcFile,
    typeName,
  );

  await destFile.save();
}

async function buildSpyClass(
  fixturesDir: ts.Directory,
  generatedDir: ts.Directory,
) : Promise<void>
{
  const srcFile = fixturesDir.addSourceFileAtPath("NumberStringType.mts");
  const destFile = generatedDir.createSourceFile("JasmineSpyClass.mts");

  /* This particular example demonstrates two features:
  (1) Manipulating the class after we create TTC.
  (2) Building custom statements in each callback.
  */
  const TTC = new TypeToClass(
    destFile,
    "JasmineSpyClass",
    TypeToClass.buildStatementsCallback(`this.spy(s, n);\nreturn s.repeat(n);\n`)
  );

  const targetClass = destFile.getClassOrThrow("JasmineSpyClass");
  targetClass.addProperty({
    name: "spy",
    isReadonly: true,
    initializer: "jasmine.createSpy()"
  });

  TTC.addTypeAliasOrInterface(
    srcFile,
    "NumberStringType"
  );

  await destFile.save();
}
