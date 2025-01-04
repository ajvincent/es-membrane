//#region preamble
import type { ClassStaticBlockDeclarationStructureClassIfc } from "../../exports.js";
import {
  type CloneableStructure,
  COPY_FIELDS,
  type ExtractStructure,
  type JSDocableNodeStructureFields,
  JSDocableNodeStructureMixin,
  type StatementedNodeStructureFields,
  StatementedNodeStructureMixin,
  StructureBase,
  StructureClassesMap,
  type StructureClassToJSON,
  type StructureFields,
  StructureMixin,
} from "../../internal-exports.js";
import MultiMixinBuilder from "mixin-decorators";
import {
  type ClassStaticBlockDeclarationStructure,
  type OptionalKind,
  StructureKind,
} from "ts-morph";
import type { Class } from "type-fest";
//#endregion preamble
const ClassStaticBlockDeclarationStructureBase = MultiMixinBuilder<
  [
    StatementedNodeStructureFields,
    JSDocableNodeStructureFields,
    StructureFields,
  ],
  typeof StructureBase
>(
  [StatementedNodeStructureMixin, JSDocableNodeStructureMixin, StructureMixin],
  StructureBase,
);

export default class ClassStaticBlockDeclarationImpl
  extends ClassStaticBlockDeclarationStructureBase
  implements ClassStaticBlockDeclarationStructureClassIfc
{
  readonly kind: StructureKind.ClassStaticBlock =
    StructureKind.ClassStaticBlock;

  public static clone(
    source: OptionalKind<ClassStaticBlockDeclarationStructure>,
  ): ClassStaticBlockDeclarationImpl {
    const target = new ClassStaticBlockDeclarationImpl();
    this[COPY_FIELDS](source, target);
    return target;
  }

  public toJSON(): StructureClassToJSON<ClassStaticBlockDeclarationImpl> {
    const rv =
      super.toJSON() as StructureClassToJSON<ClassStaticBlockDeclarationImpl>;
    rv.kind = this.kind;
    return rv;
  }
}

ClassStaticBlockDeclarationImpl satisfies CloneableStructure<
  ClassStaticBlockDeclarationStructure,
  ClassStaticBlockDeclarationImpl
> &
  Class<ExtractStructure<ClassStaticBlockDeclarationStructure["kind"]>>;
StructureClassesMap.set(
  StructureKind.ClassStaticBlock,
  ClassStaticBlockDeclarationImpl,
);
