import {
  type OptionalKind,
  type ClassDeclarationStructure,
  StructureKind,
  ConstructorDeclarationStructure,
  GetAccessorDeclarationStructure,
  MethodDeclarationStructure,
  SetAccessorDeclarationStructure,
  MethodSignatureStructure,
  PropertyDeclarationStructure,
} from "ts-morph";

import type {
  TS_Method,
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import {
  cloneArrayOrUndefined,
  stringOrWriterFunctionArray
} from "./utilities.mjs";
import MethodDeclarationImpl from "./MethodDeclarationImpl.mjs";
import { CloneableStructure } from "../types/CloneableStructure.mjs";
import PropertyDeclarationImpl from "./PropertyDeclarationImpl.mjs";
import GetAccessorDeclarationImpl from "./GetAccessorDeclarationImpl.mjs";
import SetAccessorDeclarationImpl from "./SetAccessorDeclarationImpl.mjs";
import ConstructorDeclarationImpl from "./ConstructorDeclarationImpl.mjs";

import StatementClassesMap from "./StatementClassesMap.mjs";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.mjs";
import AbstractableNode, {
  type AbstractableNodeStructureFields
} from "../decorators/AbstractableNode.mjs";
import AmbientableNode, {
  type AmbientableNodeStructureFields
} from "../decorators/AmbientableNode.mjs";
import DecoratableNode, {
  type DecoratableNodeStructureFields
} from "../decorators/DecoratableNode.mjs";
import ExportableNode, {
  type ExportableNodeStructureFields
} from "../decorators/ExportableNode.mjs";
import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "../decorators/JSDocableNode.mjs";
import NameableNode, {
  type NameableNodeStructureFields
} from "../decorators/NameableNode.mjs";
import TypeParameteredNode, {
  type TypeParameteredNodeStructureFields
} from "../decorators/TypeParameteredNode.mjs";

import MultiMixinBuilder from "#mixin_decorators/source/MultiMixinBuilder.mjs";
import StructureBase from "../decorators/StructureBase.mjs";
import StructuresClassesMap from "./StructuresClassesMap.mjs";

import createImplementsArrayProxy, {
  getManagerArrayForTypeArray
} from "../array-utilities/ImplementsArrayProxy.mjs";
import { TypeStructure } from "../typeStructures/TypeStructure.mjs";
import { getTypeStructureForCallback } from "../typeStructures/callbackToTypeStructureRegistry.mjs";

const ClassDeclarationBase = MultiMixinBuilder<
  [
    KindedStructureFields<StructureKind.Class>,
    AbstractableNodeStructureFields,
    AmbientableNodeStructureFields,
    DecoratableNodeStructureFields,
    ExportableNodeStructureFields,
    NameableNodeStructureFields,
    JSDocableNodeStructureFields,
    TypeParameteredNodeStructureFields,
  ], typeof StructureBase
>
(
  [
    KindedStructure<StructureKind.Class>(StructureKind.Class),
    AbstractableNode,
    AmbientableNode,
    DecoratableNode,
    ExportableNode,
    NameableNode,
    JSDocableNode,
    TypeParameteredNode
  ],
  StructureBase
);

export default class ClassDeclarationImpl
extends ClassDeclarationBase
implements ClassDeclarationStructure
{
  #implements: stringOrWriterFunction[] = createImplementsArrayProxy([]);

  readonly kind: StructureKind.Class = StructureKind.Class;

  extends: stringOrWriterFunction | undefined = undefined;
  ctors: ConstructorDeclarationImpl[] = [];
  properties: PropertyDeclarationImpl[] = [];
  getAccessors: GetAccessorDeclarationImpl[] = [];
  setAccessors: SetAccessorDeclarationImpl[] = [];
  methods: MethodDeclarationImpl[] = [];
  hasDeclareKeyword = false;

  get implements(): stringOrWriterFunction[] {
    return this.#implements;
  }
  /* Why not a setter?  It's not necessarily safe to do so.  With a setter, either:
    1. we hand ownership over the elements to someone else, without being able to track updates, or
    2. the array the caller passes in is not the array we have: they update it and the update doesn't stick.
  */

  // Implementing the implements[] proxy was a huge pain.
  // I'm really sure I don't want to do that, yet, for type structures.

  get implementsStructures(): TypeStructure[]
  {
    throw new Error("implementsStructures not implemented");
  }
  set implementsStructures(
    structures: TypeStructure[]
  )
  {
    throw new Error("implementsStructures not implemented");
  }

  getImplementsStructureAt(
    index: number
  ): TypeStructure | undefined
  {
    const writer = this.#implements[index];
    return typeof writer === "function" ? getTypeStructureForCallback(writer) : undefined;
  }

  getImplementsStructuresDetached(): (TypeStructure | undefined)[]
  {
    const typeManagerArray = getManagerArrayForTypeArray(this.#implements);
    return typeManagerArray.map(manager => manager.typeStructure);
  }

  appendImplementsStructures(
    ...newStructures: TypeStructure[]
  ): void
  {
    const writerSequence = newStructures.map(structure => structure.writerFunction);
    this.#implements.push(...writerSequence);
  }

  setImplementsStructureAt(
    index: number,
    structure: TypeStructure
  ): void
  {
    this.#implements[index] = structure.writerFunction;
  }

  deleteImplementsStructureAt(
    index: number
  ): boolean
  {
    const writer = this.#implements[index];
    if (typeof writer !== "function")
      return false;

    const structure = getTypeStructureForCallback(writer);
    if (!structure)
      return false;

    this.#implements.splice(index, 1);
    return true;
  }

  spliceImplementsStructures(
    start: number,
    deleteCount: number,
    ...newStructures: TypeStructure[]
  ): TypeStructure[]
  {
    const structureArray: TypeStructure[] = [];
    const typeManagerArray = getManagerArrayForTypeArray(this.#implements);

    const errors: Error[] = [];

    for (let i = start; i < start + deleteCount; i++) {
      const structure = typeManagerArray[i].typeStructure;
      if (!structure)
        errors.push(new Error(`no structure at index ${i}, this is unsafe`));
      else if (errors.length === 0)
        structureArray.push(structure);
    }

    if (errors.length > 0) {
      throw new AggregateError(errors);
    }

    const writerSequence = newStructures.map(structure => structure.writerFunction);
    this.#implements.splice(start, deleteCount, ...writerSequence);

    return structureArray;
  }

  public static clone(
    other: OptionalKind<ClassDeclarationStructure>
  ): ClassDeclarationImpl
  {
    const clone = new ClassDeclarationImpl;

    clone.extends = other.extends;
    clone.ctors = cloneArrayOrUndefined<OptionalKind<ConstructorDeclarationStructure>, typeof ConstructorDeclarationImpl>(
      other.ctors, ConstructorDeclarationImpl
    )
    clone.properties = cloneArrayOrUndefined<OptionalKind<PropertyDeclarationStructure>, typeof PropertyDeclarationImpl>(
      other.properties, PropertyDeclarationImpl
    );
    clone.getAccessors = cloneArrayOrUndefined<OptionalKind<GetAccessorDeclarationStructure>, typeof GetAccessorDeclarationImpl>(
      other.getAccessors, GetAccessorDeclarationImpl
    );
    clone.setAccessors = cloneArrayOrUndefined<OptionalKind<SetAccessorDeclarationStructure>, typeof SetAccessorDeclarationImpl>(
      other.setAccessors, SetAccessorDeclarationImpl
    );
    clone.methods = cloneArrayOrUndefined<OptionalKind<MethodDeclarationStructure>, typeof MethodDeclarationImpl>(
      other.methods, MethodDeclarationImpl
    );

    clone.implements.splice(0, clone.implements.length, ...stringOrWriterFunctionArray(other.implements));

    ClassDeclarationBase.cloneTrivia(other, clone);
    ClassDeclarationBase.cloneAbstractable(other, clone);
    ClassDeclarationBase.cloneAmbientable(other, clone);
    ClassDeclarationBase.cloneDecoratable(other, clone);
    ClassDeclarationBase.cloneExportable(other, clone);
    ClassDeclarationBase.cloneJSDocable(other, clone);
    ClassDeclarationBase.cloneNameable(other, clone);
    ClassDeclarationBase.cloneTypeParametered(other, clone);

    return clone;
  }

  public static fromMethodsOnly(
    methods: readonly OptionalKind<MethodSignatureStructure>[]
  ): ClassDeclarationImpl
  {
    const classImpl = new ClassDeclarationImpl;

    classImpl.methods = methods.map(
      (methodSignature: TS_Method) => MethodDeclarationImpl.fromSignature(methodSignature)
    );

    return classImpl;
  }
}
ClassDeclarationImpl satisfies CloneableStructure<ClassDeclarationStructure>;

StatementClassesMap.set(StructureKind.Class, ClassDeclarationImpl);
StructuresClassesMap.set(StructureKind.Class, ClassDeclarationImpl);
