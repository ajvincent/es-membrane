import fs from "fs/promises";
import path from "path";

import {
  ModuleKind,
  ModuleResolutionKind,
  Node,
  Project,
  ProjectOptions,
  ScriptTarget,
  StructureKind,
  Structures,
  SyntaxKind,
} from "ts-morph";

import {
  ModuleSourceDirectory,
  pathToModule,
} from "#utilities/source/AsyncSpecModules.js";

import {
  PromiseAllParallel
} from "#utilities/source/PromiseTypes.js";

import StructureKindToSyntaxKindMap from "#stage_one/prototype-snapshot/generated/structureToSyntax.js";
import structureToNodeMap from "#stage_one/prototype-snapshot/bootstrap/structureToNodeMap.js";

import {
  MethodSignatureImpl,
} from "#stage_one/prototype-snapshot/exports.js";

async function getSupportedKindSet(): Promise<Set<StructureKind>> {
  const stageDir: ModuleSourceDirectory = {
    pathToDirectory: "#stage_one",
    isAbsolutePath: true
  };

  const pathToStructuresDir = pathToModule(stageDir, "prototype-snapshot/structures");

  const moduleList = (await fs.readdir(pathToStructuresDir)).filter(
    fileName => fileName.endsWith("Impl.ts")
  );

  const StructureKindRE = /StructureKind\.([A-Za-z]+)/g;

  const KindList: StructureKind[] = await PromiseAllParallel(moduleList, async leafName => {
    const fileToRead = path.join(pathToStructuresDir, leafName);
    const contents = await fs.readFile(fileToRead, { encoding: "utf-8" });
    const match = contents.match(StructureKindRE)!
    return StructureKind[match[0].replace("StructureKind.", "") as keyof typeof StructureKind];
  });

  return new Set(KindList);
}
const remainingKeysBase = await getSupportedKindSet();

// no syntax kind for this, so unsupported
remainingKeysBase.delete(StructureKind.JSDocTag);

// `export = 5;`, unsupported with ECMAScript modules
remainingKeysBase.delete(StructureKind.ExportAssignment);

const TSC_CONFIG: ProjectOptions = {
  "compilerOptions": {
    "lib": ["es2022"],
    "module": ModuleKind.ESNext,
    "target": ScriptTarget.ESNext,
    "moduleResolution": ModuleResolutionKind.NodeNext,
    "sourceMap": false,
    "declaration": false,
  },
  skipAddingFilesFromTsConfig: true,
};

const project = new Project(TSC_CONFIG);

const fixturesDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../../../fixtures"
};

it("structureToNodeMap returns an accurate Map<Structure, Node>", () => {
  const remainingKeys = new Set(remainingKeysBase);
  function checkMap(
    relativePathToModuleFile: string
  ): void
  {
    const pathToModuleFile = pathToModule(fixturesDir, relativePathToModuleFile);
    project.addSourceFileAtPath(pathToModuleFile);
    const sourceFile = project.getSourceFileOrThrow(pathToModuleFile);

    let map: ReadonlyMap<Structures, Node>;
    try {
      map = structureToNodeMap(sourceFile, false);
    }
    catch (ex) {
      console.log(pathToModuleFile);
      throw ex;
    }
    map.forEach((node, structure) => {
      expect(Node.hasStructure(node)).withContext(relativePathToModuleFile).toBe(true);
      if (Node.hasStructure(node)) {
        expect<Structures>(node.getStructure()).withContext(
          `at ${pathToModuleFile}#${sourceFile.getLineAndColumnAtPos(node.getPos()).line}`
        ).toEqual(structure);
      }
      remainingKeys.delete(structure.kind);
    });
  }

  checkMap("ecma_references/classDecorators.ts");
  checkMap("ecma_references/NumberStringClass.ts");
  checkMap("stage_utilities/assert.ts");
  checkMap("stage_utilities/DefaultMap.ts");
  checkMap("stage_utilities/PromiseTypes.ts");
  checkMap("stage_utilities/PropertyKeySorter.ts");
  checkMap("stage_utilities/WeakRefSet.ts");
  checkMap("grab-bag.ts");

  let remainingKinds = Array.from(remainingKeys.keys()).map(
    (kind) => StructureKind[kind] + ": " + SyntaxKind[StructureKindToSyntaxKindMap.get(kind)!]
  );
  remainingKinds = remainingKinds.filter(kind => !kind.startsWith("Jsx"));
  remainingKinds.sort();

  expect(remainingKinds).withContext("unexamined kinds").toEqual([]);
});

it("structureToNodeMap can use the type-aware structures", () => {
  function checkMap(
    pathToModuleFile: string
  ): ReadonlyMap<Structures, Node>
  {
    pathToModuleFile = pathToModule(fixturesDir, pathToModuleFile);
    project.addSourceFileAtPath(pathToModuleFile);
    const sourceFile = project.getSourceFileOrThrow(pathToModuleFile);

    try {
      return structureToNodeMap(sourceFile, true);
    }
    catch (ex) {
      console.log(pathToModuleFile);
      throw ex;
    }
  }

  checkMap("ecma_references/classDecorators.ts");
  checkMap("stage_utilities/assert.ts");
  checkMap("stage_utilities/DefaultMap.ts");
  checkMap("stage_utilities/PromiseTypes.ts");
  checkMap("stage_utilities/PropertyKeySorter.ts");
  checkMap("grab-bag.ts");

  const structureMap = checkMap("stage_utilities/WeakRefSet.ts");
  const liveElementsSignature = Array.from(structureMap.keys()).find(
    structure => structure.kind === StructureKind.MethodSignature && structure.name === "liveElements"
  );

  expect(liveElementsSignature).toBeInstanceOf(MethodSignatureImpl);
  if (!(liveElementsSignature instanceof MethodSignatureImpl))
    return;

  /*
  const { returnTypeStructure } = liveElementsSignature;
  expect(returnTypeStructure).toBeInstanceOf(TypeArgumentedTypedStructureImpl);
  if (!(returnTypeStructure instanceof TypeArgumentedTypedStructureImpl))
    return;
  expect(returnTypeStructure.objectType).toEqual(
    new LiteralTypedStructureImpl("IterableIterator")
  );
  expect(returnTypeStructure.elements).toEqual([
    new LiteralTypedStructureImpl("T"),
  ]);
  */

  expect(liveElementsSignature.returnType).toBe("IterableIterator<T>");
});
