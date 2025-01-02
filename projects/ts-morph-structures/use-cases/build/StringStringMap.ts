import assert from "node:assert/strict";
import path from "path";

import {
  type SourceFile,
  StructureKind,
  InterfaceDeclaration,
} from "ts-morph";

import {
  type ClassBodyStatementsGetter,
  ClassDeclarationImpl,
  type ClassHeadStatementsGetter,
  type ClassTailStatementsGetter,
  type ClassStatementsGetter,
  ClassSupportsStatementsFlags,
  type ConstructorBodyStatementsGetter,
  InterfaceDeclarationImpl,
  LiteralTypeStructureImpl,
  MemberedTypeToClass,
  type MemberedStatementsKey,
  type MethodSignatureImpl,
  ParameterDeclarationImpl,
  ParameterTypeStructureImpl,
  type PropertyInitializerGetter,
  PropertySignatureImpl,
  TupleTypeStructureImpl,
  TypeArgumentedTypeStructureImpl,
  TypeMembersMap,
  TypeStructureKind,
  VoidTypeNodeToTypeStructureConsole,
  getTypeAugmentedStructure,
  parseLiteralType,
} from "#stage_two/snapshot/source/exports.js";

import {
  distDir,
  project,
  removeDistFile,
} from "./utilities/sharedProject.js";

import getTypeScriptNodes from "./utilities/typescript-builtins.js";

export default async function buildStringStringMap(): Promise<void>
{
  const moduleFile = await buildInitialModuleFile();
  const typeMembers = buildTypeMembersMap();

  // checkpoint
  {
    const interfaceTemp = new InterfaceDeclarationImpl("StringStringMapInterface");
    typeMembers.clone().moveMembersToType(interfaceTemp);
    const interfaceNode: InterfaceDeclaration = moduleFile.addInterface(interfaceTemp);
    console.log(interfaceNode.print());
    interfaceNode.remove();
  }

  const typeToClass = createClassBuilder(typeMembers);

  const classDecl = moduleFile.getClassOrThrow("StringStringMap");
  const classStructure = ClassDeclarationImpl.clone(classDecl.getStructure());

  const classMembers = typeToClass.buildClassMembersMap();
  classMembers.moveMembersToClass(classStructure);

  /*
  classDecl.set(classStructure);
  */
  classDecl.remove();
  moduleFile.addClass(classStructure);

  await moduleFile.save();
  return Promise.resolve();
}

async function buildInitialModuleFile(): Promise<SourceFile> {
  await removeDistFile("StringStringMap.ts");

  /* This is a starting point, based on our needs:
  - hashing two keys into one
  - retrieving two keys from one
  - storing the hashed keys and values in a private map
  */
  const moduleFile: SourceFile = project.createSourceFile(
    path.join(distDir, "StringStringMap.ts"),
    `
interface StringStringKey {
  readonly firstKey: string,
  readonly secondKey: string
}

export default class StringStringMap<V> {
  static #hashKeys(firstKey: string, secondKey: string): string {
    return JSON.stringify({firstKey, secondKey});
  }

  static #parseKeys(hashedKey: string): [string, string]
  {
    const { firstKey, secondKey } = JSON.parse(hashedKey) as StringStringKey;
    return [firstKey, secondKey];
  }
}
    `.trim()
  );

  return moduleFile;
}

function buildTypeMembersMap(): TypeMembersMap {
  /* What are we dealing with? */
  const MapInterfaceNodes = getTypeScriptNodes<InterfaceDeclaration>(
    sourceFile => sourceFile.getInterfaces().filter(ifc => ifc.getName() === "Map")
  ).map(entry => entry[1]);
  for (const node of MapInterfaceNodes) {
    console.log(node.print());
  }

  // Create the initial type members map
  const typeMembers = new TypeMembersMap();
  MapInterfaceNodes.forEach(node => {
    const structure = getTypeAugmentedStructure(node, VoidTypeNodeToTypeStructureConsole, true, StructureKind.Interface).rootStructure;
    typeMembers.addMembers([
      // no getters or setters to worry about
      ...structure.properties,
      ...structure.methods
    ]);
  });
  {
    const hashMap = new PropertySignatureImpl("#hashMap");
    hashMap.isReadonly = true;
    typeMembers.addMembers([hashMap]);
  }
  typeMembers.convertPropertyToAccessors("size", true, false);
  typeMembers.arrayOfKind(StructureKind.MethodSignature).forEach(modifyMethodSignature);

  return typeMembers;
}

function modifyMethodSignature(method: MethodSignatureImpl): void {
  if (method.name === "keys") {
    const { returnTypeStructure } = method;
    assert.equal(returnTypeStructure?.kind, TypeStructureKind.TypeArgumented, "Expected a type-argumented type.");
    assert.equal(returnTypeStructure.objectType, LiteralTypeStructureImpl.get("MapIterator"), "Expected a MapIterator for " + method.name);
    assert.equal(returnTypeStructure.childTypes.length, 1);
    assert.equal(returnTypeStructure.childTypes[0], LiteralTypeStructureImpl.get("K"));

    returnTypeStructure.childTypes[0] = new TupleTypeStructureImpl([
      LiteralTypeStructureImpl.get("string"),
      LiteralTypeStructureImpl.get("string"),
    ]);
    return;
  }

  if ((method.name === "entries") || (method.name === "[Symbol.iterator]")) {
    const { returnTypeStructure } = method;
    assert.equal(returnTypeStructure?.kind, TypeStructureKind.TypeArgumented, "Expected a type-argumented type.");
    assert.equal(returnTypeStructure.objectType, LiteralTypeStructureImpl.get("MapIterator"), "Expected a MapIterator for " + method.name);
    assert.equal(returnTypeStructure.childTypes.length, 1);

    assert.equal(returnTypeStructure.childTypes[0].kind, TypeStructureKind.Tuple);
    returnTypeStructure.childTypes[0].childTypes.splice(
      0, 1, LiteralTypeStructureImpl.get("string"), LiteralTypeStructureImpl.get("string")
    );
    return;
  }

  if (method.name === "forEach") {
    // forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void;
    const callbackFn: ParameterDeclarationImpl = method.parameters[0];

    const { typeStructure } = callbackFn;
    assert.equal(typeStructure?.kind, TypeStructureKind.Function, "the callback should be a function");

    const firstKeyParam = new ParameterTypeStructureImpl("firstKey", LiteralTypeStructureImpl.get("string"));
    const secondKeyParam = new ParameterTypeStructureImpl("secondKey", LiteralTypeStructureImpl.get("string"));

    typeStructure.parameters.splice(1, 1, firstKeyParam, secondKeyParam);
    typeStructure.parameters[3].typeStructure = new TypeArgumentedTypeStructureImpl(
      LiteralTypeStructureImpl.get("StringStringMap"),
      [LiteralTypeStructureImpl.get("V")]
    );
    return;
  }

  const { parameters } = method;
  const keyIndex = parameters.findIndex(param => param.name === "key");
  if (keyIndex > -1) {
    const firstParam = new ParameterDeclarationImpl("firstKey");
    firstParam.typeStructure = LiteralTypeStructureImpl.get("string");

    const secondParam = new ParameterDeclarationImpl("secondKey");
    secondParam.typeStructure = LiteralTypeStructureImpl.get("string");

    parameters.splice(keyIndex, 1, firstParam, secondParam);
  }
}

function createClassBuilder(typeMembers: TypeMembersMap): MemberedTypeToClass {
  const typeToClass = new MemberedTypeToClass();
  typeToClass.importFromTypeMembersMap(false, typeMembers);
  {
    const param = new ParameterDeclarationImpl("entries");
    param.typeStructure = parseLiteralType(`[string, string, V][]`);
    param.initializer = "[]";
    typeToClass.constructorParameters.push(param);
  }

  typeToClass.isGeneratorCallback = {
    isGenerator: function(isStatic, methodName): boolean {
      return methodName === "[Symbol.iterator]" || methodName === "keys";
    }
  };
  typeToClass.defineStatementsByPurpose("main body", false);

  const toStringTagGetter: ClassStatementsGetter & PropertyInitializerGetter = {
    keyword: "Symbol.toStringTag",
    supportsStatementsFlags: ClassSupportsStatementsFlags.PropertyInitializer,

    filterPropertyInitializer: function (key: MemberedStatementsKey): boolean {
      return key.fieldKey === "[Symbol.toStringTag]";
    },

    getPropertyInitializer: function (key: MemberedStatementsKey): string {
      void(key);
      return `"StringStringMap"`;
    }
  };

  const hashMapInitializer: ClassStatementsGetter & PropertyInitializerGetter = {
    keyword: "#hashMap",
    supportsStatementsFlags: ClassSupportsStatementsFlags.PropertyInitializer,

    filterPropertyInitializer: function (key: MemberedStatementsKey): boolean {
      return key.fieldKey === "#hashMap";
    },

    getPropertyInitializer: function (key: MemberedStatementsKey): string {
      void(key);
      return `new Map<string, V>`;
    }
  }

  const iteratorStatements: ClassStatementsGetter & ClassBodyStatementsGetter & ClassTailStatementsGetter = {
    keyword: "iterators",
    supportsStatementsFlags: ClassSupportsStatementsFlags.BodyStatements | ClassSupportsStatementsFlags.TailStatements,

    filterBodyStatements: function(key: MemberedStatementsKey): boolean {
      if (key.fieldKey !== "#hashMap")
        return false;
      return key.statementGroupKey === "keys" || key.statementGroupKey === "[Symbol.iterator]";
    },
    getBodyStatements: function(key: MemberedStatementsKey): string[] {
      return [`
        for (const x of this.#hashMap${key.statementGroupKey === "keys" ? "." + key.statementGroupKey : key.statementGroupKey}()) {
          const [ firstKey, secondKey ] = StringStringMap.#parseKeys(${key.fieldKey === "keys" ? "x" : "x[0]"});
          yield [firstKey, secondKey${key.statementGroupKey === "[Symbol.iterator]" ? ", x[1]" : ""}];
        }
      `.trim()];
    },

    filterTailStatements: function(key: MemberedStatementsKey): boolean {
      return key.statementGroupKey === "values" || key.statementGroupKey === "entries";
    },

    getTailStatements: function(key: MemberedStatementsKey): string[] {
      if (key.statementGroupKey === "values") {
        return [`return this.#hashMap.values()`];
      }

      return [`return this[Symbol.iterator]();`]
    }
  };

  const forEachStatements: ClassStatementsGetter & ClassBodyStatementsGetter = {
    keyword: "forEach",
    supportsStatementsFlags: ClassSupportsStatementsFlags.BodyStatements,

    filterBodyStatements: function(key: MemberedStatementsKey): boolean {
      return key.fieldKey === "#hashMap" && key.statementGroupKey === "forEach";
    },

    getBodyStatements: function(key: MemberedStatementsKey): string[] {
      void(key);
      return [`
        this.#hashMap.forEach((value, key): void => {
          const [ firstKey, secondKey ] = StringStringMap.#parseKeys(key);
          callbackfn.call(thisArg, value, firstKey, secondKey, this);
        }, thisArg);
      `.trim()];
    }
  };

  const forwardToMapMethods: (
    ClassStatementsGetter & ClassHeadStatementsGetter &
    ClassBodyStatementsGetter & ClassTailStatementsGetter
  ) = {
    keyword: "forward-to-map",
    supportsStatementsFlags:
      ClassSupportsStatementsFlags.HeadStatements |
      ClassSupportsStatementsFlags.BodyStatements |
      ClassSupportsStatementsFlags.TailStatements,

    filterHeadStatements: function(key: MemberedStatementsKey): boolean {
      if (key.groupType?.kind !== StructureKind.MethodSignature)
        return false;
      return Boolean(key.groupType.parameters.find(param => param.name === "firstKey"));
    },

    getHeadStatements: function(key: MemberedStatementsKey): string[] {
      void(key);
      return [`
        const key = StringStringMap.#hashKeys(firstKey, secondKey);
      `.trim()];
    },

    filterBodyStatements: function(key: MemberedStatementsKey): boolean {
      return this.filterHeadStatements(key) && key.fieldKey === "#hashMap";
    },

    getBodyStatements: function(key: MemberedStatementsKey): string[] {
      return [`
      ${
        key.statementGroupKey !== "set" ? "const rv = " : ""
      }this.#hashMap.${key.statementGroupKey}(key${
        key.statementGroupKey === "set" ? ", value" : ""
      });
      `.trim()]
    },

    filterTailStatements: function(key: MemberedStatementsKey): boolean {
      return this.filterHeadStatements(key);
    },

    getTailStatements: function(key: MemberedStatementsKey): string[] {
      if (key.statementGroupKey === "set")
        return [`return this;`];
      return [`return rv;`];
    }
  };

  const noKeyMembers: ClassStatementsGetter & ClassTailStatementsGetter & ConstructorBodyStatementsGetter = {
    keyword: "no-key-members",
    supportsStatementsFlags: ClassSupportsStatementsFlags.TailStatements | ClassSupportsStatementsFlags.ConstructorBodyStatements,

    filterTailStatements: function(key: MemberedStatementsKey): boolean {
      return key.statementGroupKey === "get size" || key.statementGroupKey === "clear";
    },

    getTailStatements: function(key: MemberedStatementsKey): string[] {
      if (key.statementGroupKey === "get size")
        return [`return this.#hashMap.size;`];
      return [
        `return this.#hashMap.clear();
      `.trim()];
    },

    filterCtorBodyStatements: function(key: MemberedStatementsKey): boolean {
      return key.fieldKey === "#hashMap";
    },

    getCtorBodyStatements: function(key: MemberedStatementsKey): string[] {
      void(key);
      return [`
        entries.forEach(([firstKey, secondKey, value]) => this.set(firstKey, secondKey, value));
      `.trim()];
    }
  };

  typeToClass.addStatementGetters(0, [
    toStringTagGetter, hashMapInitializer, iteratorStatements,
    forEachStatements, forwardToMapMethods, noKeyMembers,
  ]);
  return typeToClass;
}
