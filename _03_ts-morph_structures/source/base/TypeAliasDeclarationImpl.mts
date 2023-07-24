import {
  JSDocStructure,
  OptionalKind,
  StructureKind,
  TypeAliasDeclarationStructure,
  WriterFunction,
} from "ts-morph";

import {
  stringOrWriterFunction
} from "../types/ts-morph-native.mjs";

import {
  CloneableStructure
} from "../types/CloneableStructure.mjs";
import TypeWriterManager from "./TypeWriterManager.mjs";
import TypeParameterDeclarationImpl from "./TypeParameterDeclarationImpl.mjs";
import { stringOrWriterFunctionArray } from "./utilities.mjs";
import JSDocImpl from "./JSDocImpl.mjs";

export default class TypeAliasDeclarationImpl
extends TypeWriterManager
implements TypeAliasDeclarationStructure
{
  leadingTrivia: stringOrWriterFunction[] = [];
  trailingTrivia: stringOrWriterFunction[] = [];
  readonly kind: StructureKind.TypeAlias = StructureKind.TypeAlias;
  name: string;
  typeParameters: (string | TypeParameterDeclarationImpl)[] = [];
  docs: (string | OptionalKind<JSDocStructure>)[] = [];
  hasDeclareKeyword: boolean | undefined = undefined;
  isExported: boolean | undefined = undefined;
  isDefaultExport: boolean | undefined = undefined;

  public static clone(
    other: OptionalKind<TypeAliasDeclarationStructure>
  ): TypeAliasDeclarationImpl
  {
    const clone = new TypeAliasDeclarationImpl(other.name);

    clone.leadingTrivia = stringOrWriterFunctionArray(other.leadingTrivia);
    clone.trailingTrivia = stringOrWriterFunctionArray(other.trailingTrivia);
    clone.typeParameters = TypeParameterDeclarationImpl.cloneArray(other);
    clone.docs = JSDocImpl.cloneArray(other);
    clone.hasDeclareKeyword = other.hasDeclareKeyword;
    clone.isExported = other.isExported;
    clone.isDefaultExport = other.isDefaultExport;

    return clone;
  }

  constructor(
    name: string
  )
  {
    super();
    this.name = name;
  }

  get type(): string | WriterFunction
  {
    return super.type ?? "";
  }
}
TypeAliasDeclarationImpl satisfies CloneableStructure<TypeAliasDeclarationStructure>;
