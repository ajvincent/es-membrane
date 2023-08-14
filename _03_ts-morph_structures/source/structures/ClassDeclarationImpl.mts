// #region preamble

import {
  type OptionalKind,
  type ClassDeclarationStructure,
  StructureKind,
  ConstructorDeclarationStructure,
  GetAccessorDeclarationStructure,
  MethodDeclarationStructure,
  SetAccessorDeclarationStructure,
  PropertyDeclarationStructure,
} from "ts-morph";

import type {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import {
  cloneArrayOrUndefined,
} from "../base/utilities.mjs";

import MethodDeclarationImpl from "./MethodDeclarationImpl.mjs";
import { CloneableStructure } from "../types/CloneableStructure.mjs";
import PropertyDeclarationImpl from "./PropertyDeclarationImpl.mjs";
import GetAccessorDeclarationImpl from "./GetAccessorDeclarationImpl.mjs";
import SetAccessorDeclarationImpl from "./SetAccessorDeclarationImpl.mjs";
import ConstructorDeclarationImpl from "./ConstructorDeclarationImpl.mjs";

import StatementClassesMap from "../base/StatementClassesMap.mjs";

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
import StructureBase from "../base/StructureBase.mjs";
import StructuresClassesMap from "../base/StructuresClassesMap.mjs";

import ReadonlyArrayProxyHandler from "../array-utilities/ReadonlyArrayProxyHandler.mjs";
import TypeWriterSet from "../base/TypeWriterSet.mjs";
import type {
  ClassDeclarationWithImplementsTypeStructures
} from "../typeStructures/TypeAndTypeStructureInterfaces.mjs";

import TypeWriterManager from "../base/TypeWriterManager.mjs";
import { TypeStructures } from "../typeStructures/TypeStructures.mjs";

// #endregion preamble

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
implements ClassDeclarationStructure, ClassDeclarationWithImplementsTypeStructures
{
  static readonly #implementsArrayReadonlyHandler = new ReadonlyArrayProxyHandler(
    "The implements array is read-only.  Please use this.implementsSet to set strings, writer functions, and type structures."
  );

  readonly #extendsTypeManager = new TypeWriterManager();

  readonly #implementsShadowArray: stringOrWriterFunction[] = [];
  readonly #implementsProxyArray = new Proxy<stringOrWriterFunction[]>(
    this.#implementsShadowArray,
    ClassDeclarationImpl.#implementsArrayReadonlyHandler
  );
  readonly #implementsSet = new TypeWriterSet(this.#implementsShadowArray);

  readonly kind: StructureKind.Class = StructureKind.Class;

  get extends(): stringOrWriterFunction | undefined
  {
    return this.#extendsTypeManager.type;
  }

  set extends(
    value: stringOrWriterFunction | undefined
  )
  {
    this.#extendsTypeManager.type = value;
  }

  get extendsStructure(): TypeStructures | undefined
  {
    return this.#extendsTypeManager.typeStructure;
  }

  set extendsStructure(
    value: TypeStructures
  )
  {
    this.#extendsTypeManager.typeStructure = value;
  }

  ctors: ConstructorDeclarationImpl[] = [];
  properties: PropertyDeclarationImpl[] = [];
  getAccessors: GetAccessorDeclarationImpl[] = [];
  setAccessors: SetAccessorDeclarationImpl[] = [];
  methods: MethodDeclarationImpl[] = [];
  hasDeclareKeyword = false;

  get implements(): stringOrWriterFunction[] {
    return this.#implementsProxyArray;
  }
  /* Why not a setter?  It's not necessarily safe to do so.  With a setter, either:
    1. we hand ownership over the elements to someone else, without being able to track updates, or
    2. the array the caller passes in is not the array we have: they update it and the update doesn't stick.
  */

  get implementsSet(): TypeWriterSet {
    return this.#implementsSet;
  }

  public static clone(
    other: OptionalKind<ClassDeclarationStructure>
  ): ClassDeclarationImpl
  {
    const clone = new ClassDeclarationImpl;

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

    clone.extends = TypeWriterManager.cloneType(other.extends);

    if (typeof other.implements === "function") {
      clone.implementsSet.add(other.implements);
    }
    else if (Array.isArray(other.implements)) {
      other.implements.forEach((implementsValue: stringOrWriterFunction) => {
        clone.implementsSet.add(implementsValue);
      });
    }

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
}
ClassDeclarationImpl satisfies CloneableStructure<ClassDeclarationStructure>;

StatementClassesMap.set(StructureKind.Class, ClassDeclarationImpl);
StructuresClassesMap.set(StructureKind.Class, ClassDeclarationImpl);
