/* This is a deliberate code-style violation.  Nowhere else do we use ts-morph structures in the
structureMeta code.  As for why:  we need to copy TSDoc comments from ts-morph.d.ts into the
structure and decorator properties.
*/
import type {
  JSDocStructure
} from "ts-morph";

import {
  DefaultMap
} from "#utilities/source/DefaultMap.js";

export type StructureName = string;
export type PropertyName = string;
export type StructureUnionName = string;

export type TSMorphTypeIdentifier = string;

export enum MetaType {
  Decorator,
  Structure,
  StructureUnion
}

export interface MetaImplementation {
  readonly metaType: MetaType;
}

export class PropertyValueInUnion {
  structureName: StructureName | undefined = undefined;
  isOptionalKind = false;

  unionName: StructureUnionName | undefined = undefined;

  /**
   * @example
   * `scope?: Scope;`
   * From ScopedNodeStructure, applies to ConstructorDeclarationStructure
   */
  tsmorph_Type: string | undefined = undefined;
}

export class PropertyValue
{
  fromTypeName: string | undefined = undefined;

  mayBeString = false;
  mayBeWriter = false;
  hasQuestionToken = false;
  mayBeUndefined = false;
  representsType = false;

  otherTypes: PropertyValueInUnion[] = [];
}

class BaseMetadata
{
  readonly booleanKeys = new Set<string>;
  readonly structureFields = new Map<PropertyName, PropertyValue>;
  readonly structureFieldArrays = new Map<PropertyName, PropertyValue>;
  readonly decoratorKeys = new Set<StructureName>;
  readonly jsDocStructuresMap = new Map<PropertyName, readonly JSDocStructure[]>;

  addField(
    propertyName: PropertyName,
    isArray: boolean,
    propertyValue: PropertyValue
  ): void
  {
    const map = isArray ? this.structureFieldArrays : this.structureFields;
    const existing = map.get(propertyName);
    if (existing) {
      if (propertyValue.otherTypes.length || existing.otherTypes.length) {
        throw new Error("property name conflict for existing versus added in otherTypes: " + propertyName);
      }

      existing.mayBeString &&= propertyValue.mayBeString;
      existing.mayBeWriter &&= propertyValue.mayBeWriter;
      existing.mayBeUndefined &&= propertyValue.mayBeUndefined;
      if (!propertyValue.hasQuestionToken)
        existing.hasQuestionToken = false;

      if (!propertyValue.fromTypeName) {
        existing.fromTypeName = undefined;
      }
      else if (existing.fromTypeName && existing.fromTypeName) {
        throw new Error("property name conflict for existing versus added in fromTypeName: " + propertyName);
      }
    } else {
      map.set(propertyName, propertyValue);
    }
  }

  toJSON(): object {
    return {
      booleanKeys: Array.from(this.booleanKeys),
      structureFields: Object.fromEntries(this.structureFields),
      structureFieldArrays: Object.fromEntries(this.structureFieldArrays),
      decoratorKeys: Array.from(this.decoratorKeys),
    }
  }
}

export class DecoratorImplMeta extends BaseMetadata implements MetaImplementation
{
  #structuresUsing = new Set<StructureName>;

  readonly metaType = MetaType.Decorator;
  readonly structureName: StructureName;

  get structuresUsing(): ReadonlySet<StructureName> {
    return this.#structuresUsing;
  }

  constructor(
    structureName: StructureName
  )
  {
    super();
    this.structureName = structureName;
  }

  addStructureUsing(
    structureName: StructureName
  ): void
  {
    this.#structuresUsing.add(structureName);
  }

  isBooleanKeysOnly(): boolean {
    return this.structureFieldArrays.size + this.structureFields.size + this.decoratorKeys.size === 0;
  }
}

export class StructureImplMeta extends BaseMetadata implements MetaImplementation
{
  readonly metaType = MetaType.Structure;
  readonly structureName: StructureName;

  structureKindName = "";

  /** This may appear later. */
  syntaxKindName = "";

  constructor(
    structureName: StructureName
  )
  {
    super();
    this.structureName = structureName;
  }

  addField(
    propertyName: PropertyName,
    isArray: boolean,
    propertyValue: PropertyValue
  ): void
  {
    try {
      super.addField(propertyName, isArray, propertyValue);
      if ((propertyName === "kind") && !this.structureKindName) {
        this.structureKindName = propertyValue.otherTypes[0].tsmorph_Type!.replace("StructureKind.", "");
      }
    }
    catch (ex) {
      console.error("this.structureName = " + this.structureName);
      throw ex;
    }
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      metaType: this.metaType,
      structureName: this.structureName,
      structureKindName: this.structureKindName,
      syntaxKindName: this.syntaxKindName,
    }
  }
}

export class StructureUnionMeta implements MetaImplementation
{
  readonly metaType = MetaType.StructureUnion;
  readonly unionName: StructureName;
  readonly structureNames = new Set<StructureName>;
  readonly unionKeys = new Set<StructureUnionName>;

  constructor(
    name: StructureName
  )
  {
    this.unionName = name;
  }
}

export type StructuresMeta = DecoratorImplMeta | StructureImplMeta | StructureUnionMeta;

export class StructureMetaDictionaries
{
  readonly decorators = new Map<StructureName, DecoratorImplMeta>;
  readonly structures = new DefaultMap<StructureName, StructureImplMeta>;
  readonly unions = new Map<StructureName, StructureUnionMeta>;

  addDefinition(
    meta: StructuresMeta
  ): void
  {
    switch (meta.metaType) {
      case MetaType.Decorator:
        this.decorators.set(meta.structureName, meta);
        return;
      case MetaType.Structure:
        this.structures.set(meta.structureName, meta);
        return;

      case MetaType.StructureUnion: {
        this.unions.set(meta.unionName, meta);
        const names = Array.from(meta.unionKeys);
        names.push(...Array.from(meta.structureNames));
        return;
      }
    }
  }

  getDecoratorCountMap(): ReadonlyMap<StructureName, number>
  {
    const map = new Map<StructureName, number>;
    this.decorators.forEach((dec, name) => map.set(name, dec.structuresUsing.size));
    return map;
  }
}
