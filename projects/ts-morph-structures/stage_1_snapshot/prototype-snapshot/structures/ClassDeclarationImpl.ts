// #region preamble
import MultiMixinBuilder from "mixin-decorators";

import {
  type ClassDeclarationStructure,
  type ConstructorDeclarationStructure,
  type GetAccessorDeclarationStructure,
  type MethodDeclarationStructure,
  type OptionalKind,
  type PropertyDeclarationStructure,
  StructureKind,
  type SetAccessorDeclarationStructure,
} from "ts-morph";

import {
  ConstructorDeclarationImpl,
  GetAccessorDeclarationImpl,
  MethodDeclarationImpl,
  PropertyDeclarationImpl,
  SetAccessorDeclarationImpl,
} from "../exports.js";

import ReadonlyArrayProxyHandler from "../array-utilities/ReadonlyArrayProxyHandler.js";

import StatementClassesMap from "../base/StatementClassesMap.js";

import StructureBase from "../base/StructureBase.js";

import StructuresClassesMap from "../base/StructuresClassesMap.js";

import TypeAccessors from "../base/TypeAccessors.js";

import TypeStructureSet from "../base/TypeStructureSet.js";

import {
  cloneArrayOrUndefined, replaceWriterWithString,
} from "../base/utilities.js";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.js";
import AbstractableNode, {
  type AbstractableNodeStructureFields
} from "../decorators/AbstractableNode.js";
import AmbientableNode, {
  type AmbientableNodeStructureFields
} from "../decorators/AmbientableNode.js";
import DecoratableNode, {
  type DecoratableNodeStructureFields
} from "../decorators/DecoratableNode.js";
import ExportableNode, {
  type ExportableNodeStructureFields
} from "../decorators/ExportableNode.js";
import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "../decorators/JSDocableNode.js";
import NameableNode, {
  type NameableNodeStructureFields
} from "../decorators/NameableNode.js";
import TypeParameteredNode, {
  type TypeParameteredNodeStructureFields
} from "../decorators/TypeParameteredNode.js";

import type {
  stringOrWriterFunction
} from "../types/ts-morph-native.js";

import {
  CloneableStructure
} from "../types/CloneableStructure.js";

import type {
  ClassDeclarationWithImplementsTypeStructures
} from "../typeStructures/TypeAndTypeStructureInterfaces.js";

import {
  TypeStructures
} from "../typeStructures/TypeStructures.js";
import { ReplaceWriterInProperties } from "../types/ModifyWriterInTypes.js";
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

  readonly #extendsTypeManager = new TypeAccessors();

  readonly #implementsShadowArray: stringOrWriterFunction[] = [];
  readonly #implementsProxyArray = new Proxy<stringOrWriterFunction[]>(
    this.#implementsShadowArray,
    ClassDeclarationImpl.#implementsArrayReadonlyHandler
  );
  readonly #implementsSet = new TypeStructureSet(this.#implementsShadowArray);

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

  get implementsSet(): TypeStructureSet {
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

    clone.extends = TypeAccessors.cloneType(other.extends);

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

  public toJSON(): ReplaceWriterInProperties<ClassDeclarationStructure>
  {
    const rv = super.toJSON() as ReplaceWriterInProperties<ClassDeclarationStructure>;
    if (this.#extendsTypeManager.type) {
      rv.extends = replaceWriterWithString(this.#extendsTypeManager.type);
    }
    if (this.#implementsProxyArray) {
      rv.implements = this.#implementsProxyArray.map(replaceWriterWithString);
    }
    return rv;
  }
}
ClassDeclarationImpl satisfies CloneableStructure<ClassDeclarationStructure>;

StatementClassesMap.set(StructureKind.Class, ClassDeclarationImpl);
StructuresClassesMap.set(StructureKind.Class, ClassDeclarationImpl);
