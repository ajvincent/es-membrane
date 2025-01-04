import type { Class } from "type-fest";

import {
  type KindedStructure,
  type OptionalKind,
  StructureKind,
  type Structures,
} from "ts-morph";

import type { StructureImpls, stringOrWriterFunction } from "../exports.js";

import { type CloneableStructure } from "../internal-exports.js";

type ValueOrArray<T> = T | readonly T[];

/** @internal */
class StructureClassesMapClass extends Map<
  StructureKind,
  CloneableStructure<Structures, StructureImpls> & Class<StructureImpls>
> {
  public clone<
    StructureType extends Structures,
    StructureImplType extends StructureImpls,
  >(structure: StructureType): StructureImplType {
    return this.get(structure.kind)!.clone(structure) as StructureImplType;
  }

  #cloneWithKind<
    StructureType extends OptionalKind<Structures>,
    Kind extends StructureKind,
    ResultType extends Extract<StructureImpls, KindedStructure<Kind>>,
  >(kind: Kind, structure: OptionalKind<StructureType>): ResultType {
    return this.get(kind)!.clone(structure) as ResultType;
  }

  public cloneArray<
    StructureType extends stringOrWriterFunction | Structures,
    StructureImplType extends stringOrWriterFunction | StructureImpls,
  >(structures: readonly StructureType[]): StructureImplType[] {
    return structures.map((structure) => {
      if (typeof structure === "string" || typeof structure === "function")
        return structure;
      return this.clone(structure);
    }) as StructureImplType[];
  }

  public cloneArrayWithKind<
    StructureType extends Structures,
    Kind extends StructureKind,
    ResultType extends
      | stringOrWriterFunction
      | Extract<StructureImpls, KindedStructure<Kind>>,
  >(
    kind: Kind,
    structures: readonly (
      | stringOrWriterFunction
      | OptionalKind<StructureType>
    )[],
  ): ResultType[] {
    return structures.map((structure) => {
      if (typeof structure === "string" || typeof structure === "function")
        return structure;
      return this.get(kind)!.clone(structure) as Extract<
        StructureImpls,
        KindedStructure<Kind>
      >;
    }) as ResultType[];
  }

  cloneRequiredAndOptionalArray<
    RequiredSourceType extends Structures,
    RequiredSourceKind extends StructureKind,
    OptionalSourceType extends OptionalKind<Structures>,
    OptionalSourceKind extends StructureKind,
    RequiredTargetType extends Extract<
      StructureImpls,
      KindedStructure<RequiredSourceKind>
    >,
    OptionalTargetType extends Extract<
      StructureImpls,
      KindedStructure<OptionalSourceKind>
    >,
  >(
    sources: ValueOrArray<RequiredSourceType | OptionalSourceType>,
    requiredSourceKind: RequiredSourceKind,
    optionalSourceKind: OptionalSourceKind,
  ): readonly (RequiredTargetType | OptionalTargetType)[] {
    const sourceArray = this.forceArray<
      RequiredSourceType | OptionalSourceType
    >(sources);

    return sourceArray.map((sourceValue) =>
      this.#cloneRequiredOrOptionalStructure<
        RequiredSourceType,
        RequiredSourceKind,
        OptionalSourceType,
        OptionalSourceKind,
        RequiredTargetType,
        OptionalTargetType
      >(sourceValue, requiredSourceKind, optionalSourceKind),
    );
  }

  #cloneRequiredOrOptionalStructure<
    RequiredSourceType extends Structures,
    RequiredSourceKind extends StructureKind,
    OptionalSourceType extends OptionalKind<Structures>,
    OptionalSourceKind extends StructureKind,
    RequiredTargetType extends Extract<
      StructureImpls,
      KindedStructure<RequiredSourceKind>
    >,
    OptionalTargetType extends Extract<
      StructureImpls,
      KindedStructure<OptionalSourceKind>
    >,
  >(
    sourceValue: RequiredSourceType | OptionalSourceType,
    requiredSourceKind: RequiredSourceKind,
    optionalSourceKind: OptionalSourceKind,
  ): RequiredTargetType | OptionalTargetType {
    if (sourceValue.kind === requiredSourceKind) {
      return this.#cloneWithKind<
        RequiredSourceType,
        RequiredSourceKind,
        RequiredTargetType
      >(requiredSourceKind, sourceValue as RequiredSourceType);
    }

    return this.#cloneWithKind<
      OptionalSourceType,
      OptionalSourceKind,
      OptionalTargetType
    >(optionalSourceKind, sourceValue as OptionalSourceType);
  }

  public forceArray<
    SourceType extends
      | Structures
      | OptionalKind<Structures>
      | stringOrWriterFunction,
  >(sources: ValueOrArray<SourceType>): SourceType[] {
    if (Array.isArray(sources)) {
      return sources as SourceType[];
    }
    return [sources as SourceType];
  }
}

const StructureClassesMap = new StructureClassesMapClass();
export default StructureClassesMap;
