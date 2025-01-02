import {
  TypeNode,
} from "ts-morph";

import type {
  ModuleSourceDirectory,
} from "#utilities/source/AsyncSpecModules.js";

import getTS_SourceFile from "#utilities/source/getTS_SourceFile.js";

import {
  ClassDeclarationImpl,
  FunctionTypedStructureImpl,
  getTypeAugmentedStructure,
  LiteralTypedStructureImpl,
  MethodDeclarationImpl,
  TypeArgumentedTypedStructureImpl,
  TypeNodeToTypeStructureConsole,
  TypeParameterDeclarationImpl,
} from "#stage_one/prototype-snapshot/exports.js";

it("getTypeAugmentedStructure gets structures having type structures for types", () => {
  const stageDir: ModuleSourceDirectory = {
    importMeta: import.meta,
    pathToDirectory: "../../.."
  };

  const sourceFile = getTS_SourceFile(stageDir, "fixtures/stage_utilities/DefaultMap.ts");
  const DefaultWeakMapClass = sourceFile.getClassOrThrow("DefaultWeakMap");

  function typeStructureConsole(
    message: string,
    failingTypeNode: TypeNode
  ): void {
    void(message);
    void(failingTypeNode);
  }
  typeStructureConsole satisfies TypeNodeToTypeStructureConsole;

  const {
    rootNode,
    rootStructure,
    failures,
  } = getTypeAugmentedStructure(DefaultWeakMapClass, typeStructureConsole);
  expect(rootNode).toBe(DefaultWeakMapClass);

  expect(rootStructure).toBeInstanceOf(ClassDeclarationImpl);
  if (!(rootStructure instanceof ClassDeclarationImpl))
    return;

  expect(rootStructure.typeParameters.length).toBe(2);
  if (rootStructure.typeParameters.length === 2) {
    const [firstParam, secondParam] = rootStructure.typeParameters;
    expect(firstParam).toBeInstanceOf(TypeParameterDeclarationImpl);
    if (firstParam instanceof TypeParameterDeclarationImpl) {
      expect(firstParam.name).toBe("K");
      expect(firstParam.constraintStructure).toBeInstanceOf(LiteralTypedStructureImpl);
      if (firstParam.constraintStructure instanceof LiteralTypedStructureImpl) {
        expect(firstParam.constraintStructure.stringValue).toBe("object");
      }
    }

    expect(secondParam).toBeInstanceOf(TypeParameterDeclarationImpl);
    if (secondParam instanceof TypeParameterDeclarationImpl) {
      expect(secondParam.name).toBe("V");
      expect(secondParam.constraintStructure).toBe(undefined);
      expect(secondParam.constraint).toBe(undefined);
    }
  }

  const { extendsStructure } = rootStructure;

  expect(extendsStructure).toBeInstanceOf(TypeArgumentedTypedStructureImpl);
  if (extendsStructure instanceof TypeArgumentedTypedStructureImpl) {
    expect((extendsStructure.objectType as LiteralTypedStructureImpl)?.stringValue).toBe("WeakMap");
    expect((extendsStructure.childTypes[0] as LiteralTypedStructureImpl)?.stringValue).toBe("K");
    expect((extendsStructure.childTypes[1] as LiteralTypedStructureImpl)?.stringValue).toBe("V");
  }

  expect(rootStructure.methods.length).toBe(1);

  const getDefaultMethod = rootStructure.methods[0]
  expect(getDefaultMethod).toBeInstanceOf(MethodDeclarationImpl);
  if (getDefaultMethod instanceof MethodDeclarationImpl) {
    expect(getDefaultMethod.typeParameters.length).toBe(0)
    expect(getDefaultMethod.parameters.length).toBe(2);
    if (getDefaultMethod.parameters.length === 2) {
      const [key, builder] = getDefaultMethod.parameters;
      expect((key.typeStructure as LiteralTypedStructureImpl)?.stringValue).toBe("K");

      expect(builder.typeStructure).toBeInstanceOf(FunctionTypedStructureImpl)
      if (builder.typeStructure instanceof FunctionTypedStructureImpl) {
        expect(builder.typeStructure.typeParameters.length).toBe(0)
        expect(builder.typeStructure.parameters.length).toBe(0);
        expect((builder.typeStructure.returnType as LiteralTypedStructureImpl)?.stringValue).toBe("V");
      }
    }
  }

  expect(failures.length).toBe(0);
});
