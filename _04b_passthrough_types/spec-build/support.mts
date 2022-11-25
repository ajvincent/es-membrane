import ts from "ts-morph";

import path from "path";
import fs from "fs/promises";
import url from "url";

const parentDir = path.resolve(url.fileURLToPath(import.meta.url), "../..");

import ComponentClassGenerator from "../source/ComponentClassGenerator.mjs";
import ProjectDriver from "../source/ProjectDriver.mjs";

export default async function() : Promise<void>
{
  await Promise.all([
    buildComponentClasses(),
    buildProjectDirectory("base"),
    buildProjectDirectory("debug"),
    buildProjectDirectory("optimized"),
  ]);
}

async function buildComponentClasses() : Promise<void>
{
  await fs.mkdir(
    path.join(parentDir, "spec-generated/component-classes")
  );

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

  const fixturesDir  = project.addDirectoryAtPath(path.join(parentDir, "fixtures"));
  const generatedDir = project.addDirectoryAtPath(path.join(parentDir, "spec-generated/component-classes"));

  const generator = new ComponentClassGenerator(
    fixturesDir.addSourceFileAtPath("NumberStringType.mts"),
    "NumberStringType",
    generatedDir,
    "NumberStringClass",
    "NumberStringType",
  );

  await generator.run();

  await createJasmineSpyClass(generatedDir);
}

async function createJasmineSpyClass(
  generatedDir: ts.Directory,
  leafName = "PassThrough_JasmineSpy.mts",
  doNotReturn = false
) : Promise<void>
{
  const NI_File = generatedDir.getSourceFileOrThrow("PassThrough_NotImplemented.mts");
  const SpyClassFile = NI_File.copy(path.join(".", leafName));

  const SpyClass = SpyClassFile.getClassOrThrow("NumberStringClass_PassThroughNI");
  SpyClass.rename("NumberStringClass_JasmineSpy");

  SpyClassFile.addTypeAlias({
    name: "PassThroughClassWithSpy",
    type: "PassThroughClassType & { spy: jasmine.Spy }",
    isExported: true
  });

  SpyClass.removeImplements(0);
  SpyClass.addImplements("PassThroughClassWithSpy");
  SpyClass.addProperty({
    name: "spy",
    isReadonly: true,
    initializer: "jasmine.createSpy()"
  });

  const methods = SpyClass.getMethods();
  methods.forEach(method => {
    const name = method.getName();

    const throwLine = method.getStatementByKindOrThrow(ts.SyntaxKind.ThrowStatement);
    method.removeStatement(throwLine.getChildIndex());
    method.addStatements(doNotReturn ?
      `this.spy("${name}", __passThrough__, s, n)`
      :
      `__passThrough__.setReturnValue(
        this.spy("${name}", __passThrough__, s, n) as ReturnType<NumberStringType["${name}"]>
      );`
    );
  });

  SpyClassFile.formatText({
    ensureNewLineAtEndOfFile: true,
    placeOpenBraceOnNewLineForFunctions: true,
    indentSize: 2,
  });

  await SpyClassFile.save();
}

async function buildProjectDirectory(tail: string) : Promise<void>
{
  const project = (await ProjectDriver(
    path.join(parentDir, `fixtures/NumberString-${tail}.json`),
    tail === "optimized"
  ))[0];

  await createJasmineSpyClass(
    project.getDirectoryOrThrow(
      path.join(parentDir, "spec-generated/project/generated-" + tail)
    ),
    "PassThrough_JasmineSpy_WithReturn.mts",
    false
  );

  await createJasmineSpyClass(
    project.getDirectoryOrThrow(
      path.join(parentDir, "spec-generated/project/generated-" + tail)
    ),
    "PassThrough_JasmineSpy_NoReturn.mts",
    true
  );
}
