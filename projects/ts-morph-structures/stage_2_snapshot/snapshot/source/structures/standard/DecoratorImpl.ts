//#region preamble
import type {
  DecoratorStructureClassIfc,
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
  type DecoratorStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const DecoratorStructureBase = MultiMixinBuilder<
  [NamedNodeStructureFields, StructureFields],
  typeof StructureBase
>([NamedNodeStructureMixin, StructureMixin], StructureBase);

export default class DecoratorImpl
  extends DecoratorStructureBase
  implements DecoratorStructureClassIfc
{
  readonly kind: StructureKind.Decorator = StructureKind.Decorator;
  /**
   * Arguments for a decorator factory.
   * @remarks Provide an empty array to make the structure a decorator factory.
   */
  readonly arguments: stringOrWriterFunction[] = [];
  readonly typeArguments: string[] = [];

  constructor(name: string) {
    super();
    this.name = name;
  }

  /** @internal */
  public static [COPY_FIELDS](
    source: OptionalKind<DecoratorStructure>,
    target: DecoratorImpl,
  ): void {
    super[COPY_FIELDS](source, target);
    if (Array.isArray(source.arguments)) {
      target.arguments.push(...source.arguments);
    } else if (source.arguments !== undefined) {
      target.arguments.push(source.arguments);
    }

    if (Array.isArray(source.typeArguments)) {
      target.typeArguments.push(...source.typeArguments);
    } else if (source.typeArguments !== undefined) {
      target.typeArguments.push(source.typeArguments);
    }
  }

  public static clone(source: OptionalKind<DecoratorStructure>): DecoratorImpl {
    const target = new DecoratorImpl(source.name);
    this[COPY_FIELDS](source, target);
    return target;
  }

  public toJSON(): StructureClassToJSON<DecoratorImpl> {
    const rv = super.toJSON() as StructureClassToJSON<DecoratorImpl>;
    rv.arguments = this.arguments.map((value) => {
      return StructureBase[REPLACE_WRITER_WITH_STRING](value);
    });
    rv.kind = this.kind;
    rv.typeArguments = this.typeArguments;
    return rv;
  }
}

DecoratorImpl satisfies CloneableStructure<DecoratorStructure, DecoratorImpl> &
  Class<ExtractStructure<DecoratorStructure["kind"]>>;
StructureClassesMap.set(StructureKind.Decorator, DecoratorImpl);
