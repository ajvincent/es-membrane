import {
  StructureKind,
} from "ts-morph";

import type {
  ModuleSourceDirectory,
} from "#utilities/source/AsyncSpecModules.js";

import getTS_SourceFile from "#utilities/source/getTS_SourceFile.js";

import {
  ClassDeclarationImpl,
  FunctionTypeStructureImpl,
  getTypeAugmentedStructure,
  LiteralTypeStructureImpl,
  MethodDeclarationImpl,
  TypeArgumentedTypeStructureImpl,
  TypeParameterDeclarationImpl,
  VoidTypeNodeToTypeStructureConsole,
} from "#stage_two/snapshot/source/exports.js";

it("getTypeAugmentedStructure gets structures having type structures for types", () => {
  const stageDir: ModuleSourceDirectory = {
    isAbsolutePath: true,
    pathToDirectory: "#stage_two",
  };

  const sourceFile = getTS_SourceFile(stageDir, "fixtures/stage_utilities/DefaultMap.ts");
  const DefaultWeakMapClass = sourceFile.getClassOrThrow("DefaultWeakMap");

  const {
    rootStructure,
    failures
  } = getTypeAugmentedStructure(DefaultWeakMapClass, VoidTypeNodeToTypeStructureConsole, false);

  expect(rootStructure).toBeInstanceOf(ClassDeclarationImpl);
  if (!(rootStructure instanceof ClassDeclarationImpl))
    return;

  expect(rootStructure.typeParameters.length).toBe(2);
  if (rootStructure.typeParameters.length === 2) {
    const [firstParam, secondParam] = rootStructure.typeParameters;
    expect(firstParam).toBeInstanceOf(TypeParameterDeclarationImpl);
    if (firstParam instanceof TypeParameterDeclarationImpl) {
      expect(firstParam.name).toBe("K");
      expect(firstParam.constraintStructure).toBe(LiteralTypeStructureImpl.get("object"));
    }

    expect(secondParam).toBeInstanceOf(TypeParameterDeclarationImpl);
    if (secondParam instanceof TypeParameterDeclarationImpl) {
      expect(secondParam.name).toBe("V");
      expect(secondParam.constraintStructure).toBe(undefined);
      expect(secondParam.constraint).toBe(undefined);
    }
  }

  const { extendsStructure } = rootStructure;

  expect(extendsStructure).toBeInstanceOf(TypeArgumentedTypeStructureImpl);
  if (extendsStructure instanceof TypeArgumentedTypeStructureImpl) {
    expect(extendsStructure.objectType).toBe(LiteralTypeStructureImpl.get("WeakMap"));
    expect(extendsStructure.childTypes[0]).toBe(LiteralTypeStructureImpl.get("K"));
    expect(extendsStructure.childTypes[1]).toBe(LiteralTypeStructureImpl.get("V"));
  }

  expect(rootStructure.methods.length).toBe(1);

  const getDefaultMethod = rootStructure.methods[0];
  expect(getDefaultMethod).toBeInstanceOf(MethodDeclarationImpl);
  if (getDefaultMethod instanceof MethodDeclarationImpl) {
    expect(getDefaultMethod.typeParameters.length).toBe(0);
    expect(getDefaultMethod.parameters.length).toBe(2);
    if (getDefaultMethod.parameters.length === 2) {
      const [key, builder] = getDefaultMethod.parameters;
      expect(key.typeStructure).toBe(LiteralTypeStructureImpl.get("K"));

      expect(builder.typeStructure).toBeInstanceOf(FunctionTypeStructureImpl)
      if (builder.typeStructure instanceof FunctionTypeStructureImpl) {
        expect(builder.typeStructure.typeParameters.length).toBe(0)
        expect(builder.typeStructure.parameters.length).toBe(0);
        expect(builder.typeStructure.returnType).toBe(LiteralTypeStructureImpl.get("V"));
      }
    }
  }

  expect(failures.length).withContext("failure count").toBe(0);
});

it("getTypeAugmentedStructure can specify the structure kind", () => {
  const stageDir: ModuleSourceDirectory = {
    isAbsolutePath: true,
    pathToDirectory: "#stage_two",
  };

  const sourceFile = getTS_SourceFile(stageDir, "fixtures/stage_utilities/DefaultMap.ts");
  const DefaultWeakMapClass = sourceFile.getClassOrThrow("DefaultWeakMap");

  expect(() => getTypeAugmentedStructure(
    DefaultWeakMapClass, VoidTypeNodeToTypeStructureConsole, true, StructureKind.Method
  )).toThrowError();

  const {
    rootStructure,
  } = getTypeAugmentedStructure(
    DefaultWeakMapClass, VoidTypeNodeToTypeStructureConsole, true, StructureKind.Class
  );
  expect(rootStructure.kind).toBe(StructureKind.Class);
});
