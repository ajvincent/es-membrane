//#region preamble
import type {
  PropertyAssignmentStructureClassIfc,
  stringOrWriterFunction,
} from "../../exports.js";
import {
  type CloneableStructure,
  COPY_FIELDS,
  type ExtractStructure,
  type NamedNodeStructureFields,
  NamedNodeStructureMixin,
  REPLACE_WRITER_WITH_STRING,
  StructureBase,
  StructureClassesMap,
  type StructureClassToJSON,
  type StructureFields,
  StructureMixin,
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

export default class PropertyAssignmentImpl
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
