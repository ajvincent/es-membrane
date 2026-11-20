import assert from "node:assert/strict";

import {
  InterfaceDeclarationImpl,
  PropertySignatureImpl,
  QualifiedNameTypeStructureImpl,
  SourceFileImpl,
  type TypeMemberImpl,
  TypeMembersMap,
} from "#stage_one/snapshot/source/exports.js";

import {
  InterfaceModifiersMap
} from "../build/interfaces/specialCases/map.js";

import type  {
  InterfaceModuleModifierTraps
} from "../types/InterfaceModuleModifierTraps.js";

import BaseModule from "./BaseModule.js";
import OrderedSet from "./OrderedSet.js";
import SuffixMap from "./SuffixMap.js";

import {
  sortMemberNames
} from "./sortClassMembers.js";

export default
class InterfaceModule extends BaseModule {
  static readonly decoratorsMap = new SuffixMap<InterfaceModule>("ClassIfc");
  static readonly structuresMap = new SuffixMap<InterfaceModule>("ClassIfc");
  static readonly flatTypesMap = new SuffixMap<TypeMembersMap>("ClassIfc");

  static #entryComparator(
    this: void,
    a: [string, TypeMemberImpl],
    b: [string, TypeMemberImpl]
  ): number
  {
    return sortMemberNames(a[0], b[0]);
  }

  readonly typeMembers: TypeMembersMap;
  readonly extendsSet: OrderedSet<string>;

  readonly modifiers: InterfaceModuleModifierTraps | undefined;

  #structureKindName?: string;
  get structureKindName(): string | undefined {
    return this.#structureKindName;
  }
  set structureKindName(value: string) {
    assert(this.#structureKindName === undefined, "we should only set the structure kind once for " + this.defaultExportName);
    this.#structureKindName = value;

    const kindProperty = new PropertySignatureImpl("kind");
    kindProperty.isReadonly = true;
    kindProperty.typeStructure = new QualifiedNameTypeStructureImpl(["StructureKind", value]);
    this.typeMembers.addMembers([kindProperty]);
    this.addImports("ts-morph", [], ["StructureKind"]);
  }

  constructor(
    interfaceName: string,
  )
  {
    super("source/interfaces/standard", interfaceName, true);
    this.typeMembers = new TypeMembersMap;
    this.extendsSet = new OrderedSet<string>;

    this.modifiers = InterfaceModifiersMap.get(this.defaultExportName.replace(/ClassIfc$/, ""));
  }

  public applyModifiers(): void {
    this.modifiers?.modifyTypeMembers?.(this);
  }

  protected getSourceFileImpl(): SourceFileImpl {
    const sourceFile = new SourceFileImpl;

    const interfaceDecl = new InterfaceDeclarationImpl(this.defaultExportName);
    interfaceDecl.isExported = true;
    this.typeMembers.sortEntries(InterfaceModule.#entryComparator);
    this.typeMembers.clone().moveMembersToType(interfaceDecl);
    sourceFile.statements.push(
      ...this.importManager.getDeclarations(),
      interfaceDecl
    );

    return sourceFile;
  }

  public toJSON(): object {
    return {
      ...super.toJSON(),
      structureKindName: this.#structureKindName,
      extendsSet: Array.from(this.extendsSet),
      typeMembers: this.typeMembers,
    };
  }
}
