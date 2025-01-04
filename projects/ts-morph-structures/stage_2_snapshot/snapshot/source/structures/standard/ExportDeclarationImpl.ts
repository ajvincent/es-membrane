//#region preamble
import type {
  ExportDeclarationStructureClassIfc,
  ExportSpecifierImpl,
  ImportAttributeImpl,
  stringOrWriterFunction,
} from "../../exports.js";
import {
  type CloneableStructure,
  COPY_FIELDS,
  type ExtractStructure,
  REPLACE_WRITER_WITH_STRING,
  StructureBase,
  StructureClassesMap,
  type StructureClassToJSON,
  type StructureFields,
  StructureMixin,
} from "../../internal-exports.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type ExportDeclarationStructure,
  type ExportSpecifierStructure,
  type ImportAttributeStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const ExportDeclarationStructureBase = MultiMixinBuilder<
  [StructureFields],
  typeof StructureBase
>([StructureMixin], StructureBase);

export default class ExportDeclarationImpl
  extends ExportDeclarationStructureBase
  implements ExportDeclarationStructureClassIfc
{
  readonly kind: StructureKind.ExportDeclaration =
    StructureKind.ExportDeclaration;
  attributes?: ImportAttributeImpl[];
  isTypeOnly = false;
  moduleSpecifier?: string = undefined;
  readonly namedExports: (ExportSpecifierImpl | stringOrWriterFunction)[] = [];
  namespaceExport?: string = undefined;

  /** @internal */
  public static [COPY_FIELDS](
    source: OptionalKind<ExportDeclarationStructure>,
    target: ExportDeclarationImpl,
  ): void {
    super[COPY_FIELDS](source, target);
    if (source.attributes) {
      target.attributes = [];
      target.attributes.push(
        ...StructureClassesMap.cloneArrayWithKind<
          ImportAttributeStructure,
          StructureKind.ImportAttribute,
          ImportAttributeImpl
        >(
          StructureKind.ImportAttribute,
          StructureClassesMap.forceArray(source.attributes),
        ),
      );
    }

    target.isTypeOnly = source.isTypeOnly ?? false;
    if (source.moduleSpecifier) {
      target.moduleSpecifier = source.moduleSpecifier;
    }

    if (source.namedExports) {
      target.namedExports.push(
        ...StructureClassesMap.cloneArrayWithKind<
          ExportSpecifierStructure,
          StructureKind.ExportSpecifier,
          ExportSpecifierImpl | stringOrWriterFunction
        >(
          StructureKind.ExportSpecifier,
          StructureClassesMap.forceArray(source.namedExports),
        ),
      );
    }

    if (source.namespaceExport) {
      target.namespaceExport = source.namespaceExport;
    }
  }

  public static clone(
    source: OptionalKind<ExportDeclarationStructure>,
  ): ExportDeclarationImpl {
    const target = new ExportDeclarationImpl();
    this[COPY_FIELDS](source, target);
    return target;
  }

  public toJSON(): StructureClassToJSON<ExportDeclarationImpl> {
    const rv = super.toJSON() as StructureClassToJSON<ExportDeclarationImpl>;
    if (this.attributes) {
      rv.attributes = this.attributes;
    } else {
      rv.attributes = undefined;
    }

    rv.isTypeOnly = this.isTypeOnly;
    rv.kind = this.kind;
    if (this.moduleSpecifier) {
      rv.moduleSpecifier = this.moduleSpecifier;
    } else {
      rv.moduleSpecifier = undefined;
    }

    rv.namedExports = this.namedExports.map((value) => {
      if (typeof value === "object") {
        return value;
      }
      return StructureBase[REPLACE_WRITER_WITH_STRING](value);
    });
    if (this.namespaceExport) {
      rv.namespaceExport = this.namespaceExport;
    } else {
      rv.namespaceExport = undefined;
    }

    return rv;
  }
}

ExportDeclarationImpl satisfies CloneableStructure<
  ExportDeclarationStructure,
  ExportDeclarationImpl
> &
  Class<ExtractStructure<ExportDeclarationStructure["kind"]>>;
StructureClassesMap.set(StructureKind.ExportDeclaration, ExportDeclarationImpl);
