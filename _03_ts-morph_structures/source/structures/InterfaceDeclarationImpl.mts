// #region preamble
import MultiMixinBuilder from "mixin-decorators";

import {
  type InterfaceDeclarationStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";

import ReadonlyArrayProxyHandler from "../array-utilities/ReadonlyArrayProxyHandler.mjs";

import StructureBase from "../base/StructureBase.mjs";

import StatementClassesMap from "../base/StatementClassesMap.mjs";

import StructuresClassesMap from "../base/StructuresClassesMap.mjs";

import TypeStructureSet from "../base/TypeStructureSet.mjs";

import KindedStructure, {
  type KindedStructureFields
} from "../decorators/KindedStructure.mjs";
import AmbientableNode, {
  type AmbientableNodeStructureFields
} from "../decorators/AmbientableNode.mjs";
import ExportableNode, {
  type ExportableNodeStructureFields
} from "../decorators/ExportableNode.mjs";
import NamedNode, {
  type NamedNodeStructureFields
} from "../decorators/NamedNode.mjs";
import JSDocableNode, {
  type JSDocableNodeStructureFields
} from "../decorators/JSDocableNode.mjs";
import TypeElementMemberedNode, {
  type TypeElementMemberedNodeStructureFields
} from "../decorators/TypeElementMemberedNode.mjs";
import TypeParameteredNode, {
  type TypeParameteredNodeStructureFields
} from "../decorators/TypeParameteredNode.mjs";

import type {
  CloneableStructure
} from "../types/CloneableStructure.mjs";

import {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";
import { InterfaceDeclarationWithExtendsTypeStructures } from "../typeStructures/TypeAndTypeStructureInterfaces.mjs";
// #endregion preamble

const InterfaceDeclarationBase = MultiMixinBuilder<
  [
    KindedStructureFields<StructureKind.Interface>,
    AmbientableNodeStructureFields,
    ExportableNodeStructureFields,
    JSDocableNodeStructureFields,
    NamedNodeStructureFields,
    TypeElementMemberedNodeStructureFields,
    TypeParameteredNodeStructureFields,
  ],
  typeof StructureBase
>
(
  [
    KindedStructure<StructureKind.Interface>(StructureKind.Interface),
    AmbientableNode,
    ExportableNode,
    JSDocableNode,
    NamedNode,
    TypeElementMemberedNode,
    TypeParameteredNode,
  ],
  StructureBase
);

export default class InterfaceDeclarationImpl
extends InterfaceDeclarationBase
implements InterfaceDeclarationStructure, InterfaceDeclarationWithExtendsTypeStructures
{
  static readonly #extendsArrayReadonlyHandler = new ReadonlyArrayProxyHandler(
    "The extends array is read-only.  Please use this.extendsSet to set strings, writer functions, and type structures."
  );

  readonly #extendsShadowArray: stringOrWriterFunction[] = [];
  readonly #extendsProxyArray = new Proxy<stringOrWriterFunction[]>(
    this.#extendsShadowArray,
    InterfaceDeclarationImpl.#extendsArrayReadonlyHandler
  );
  readonly #extendsSet = new TypeStructureSet(this.#extendsShadowArray);

  name: string;

  constructor(
    name: string
  )
  {
    super();
    this.name = name;
  }

  get extends(): stringOrWriterFunction[] {
    return this.#extendsProxyArray;
  }
  /* Why not a setter?  It's not necessarily safe to do so.  With a setter, either:
    1. we hand ownership over the elements to someone else, without being able to track updates, or
    2. the array the caller passes in is not the array we have: they update it and the update doesn't stick.
  */

  get extendsSet(): TypeStructureSet {
    return this.#extendsSet;
  }

  public static clone(
    other: OptionalKind<InterfaceDeclarationStructure>
  ): InterfaceDeclarationImpl
  {
    const clone = new InterfaceDeclarationImpl(other.name);

    if (typeof other.extends === "function") {
      clone.extendsSet.add(other.extends);
    }
    else if (Array.isArray(other.extends)) {
      other.extends.forEach((extendsValue: stringOrWriterFunction) => {
        clone.extendsSet.add(extendsValue)
      });
    }

    InterfaceDeclarationBase.cloneTrivia(other, clone);
    InterfaceDeclarationBase.cloneAmbientable(other, clone);
    InterfaceDeclarationBase.cloneExportable(other, clone);
    InterfaceDeclarationBase.cloneJSDocable(other, clone);
    InterfaceDeclarationBase.cloneTypeElementMembered(other, clone);
    InterfaceDeclarationBase.cloneTypeParametered(other, clone);

    return clone;
  }
}
InterfaceDeclarationImpl satisfies CloneableStructure<InterfaceDeclarationStructure>;

StatementClassesMap.set(StructureKind.Interface, InterfaceDeclarationImpl);
StructuresClassesMap.set(StructureKind.Interface, InterfaceDeclarationImpl);
