//#region preamble
import { StructureBase } from "../../base/StructureBase.js";
import { StructureClassesMap } from "../../base/StructureClassesMap.js";
import {
  COPY_FIELDS,
  REPLACE_WRITER_WITH_STRING,
} from "../../base/symbolKeys.js";
import {
  type NamedNodeStructureFields,
  NamedNodeStructureMixin,
} from "../../decorators/standard/NamedNodeStructureMixin.js";
import {
  type StructureFields,
  StructureMixin,
} from "../../decorators/standard/StructureMixin.js";
import type {
  PropertyAssignmentStructureClassIfc,
  stringOrWriterFunction,
} from "../../exports.js";
import type {
  CloneableStructure,
  ExtractStructure,
  StructureClassToJSON,
} from "../../internal-exports.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type OptionalKind,
  type PropertyAssignmentStructure,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const PropertyAssignmentStructureBase = MultiMixinBuilder<
  [NamedNodeStructureFields, StructureFields],
  typeof StructureBase
>([NamedNodeStructureMixin, StructureMixin], StructureBase);

export class PropertyAssignmentImpl
  extends PropertyAssignmentStructureBase
  implements PropertyAssignmentStructureClassIfc
{
  readonly kind: StructureKind.PropertyAssignment =
    StructureKind.PropertyAssignment;
  initializer: stringOrWriterFunction;

  constructor(name: string, initializer: stringOrWriterFunction) {
    super();
    this.initializer = initializer;
    this.name = name;
  }

  /** @internal */
  public static [COPY_FIELDS](
    source: OptionalKind<PropertyAssignmentStructure>,
    target: PropertyAssignmentImpl,
  ): void {
    super[COPY_FIELDS](source, target);
    target.initializer = source.initializer;
  }

  /**
   * Create a `PropertyAssignmentImpl` from a `PropertyAssignmentStructure`.
   * @param source - The structure to clone.
   */
  public static clone(
    source: OptionalKind<PropertyAssignmentStructure>,
  ): PropertyAssignmentImpl {
    const target = new PropertyAssignmentImpl(source.name, source.initializer);
    this[COPY_FIELDS](source, target);
    return target;
  }

  public toJSON(): StructureClassToJSON<PropertyAssignmentImpl> {
    const rv = super.toJSON() as StructureClassToJSON<PropertyAssignmentImpl>;
    rv.initializer = StructureBase[REPLACE_WRITER_WITH_STRING](
      this.initializer,
    );
    rv.kind = this.kind;
    return rv;
  }
}

PropertyAssignmentImpl satisfies CloneableStructure<
  PropertyAssignmentStructure,
  PropertyAssignmentImpl
> &
  Class<ExtractStructure<PropertyAssignmentStructure["kind"]>>;
StructureClassesMap.set(
  StructureKind.PropertyAssignment,
  PropertyAssignmentImpl,
);
