//#region preamble
import { StructureBase } from "../../base/StructureBase.js";
import { StructureClassesMap } from "../../base/StructureClassesMap.js";
import { COPY_FIELDS } from "../../base/symbolKeys.js";
import {
  type JSDocableNodeStructureFields,
  JSDocableNodeStructureMixin,
} from "../../decorators/standard/JSDocableNodeStructureMixin.js";
import {
  type StatementedNodeStructureFields,
  StatementedNodeStructureMixin,
} from "../../decorators/standard/StatementedNodeStructureMixin.js";
import {
  type StructureFields,
  StructureMixin,
} from "../../decorators/standard/StructureMixin.js";
import type { ClassStaticBlockDeclarationStructureClassIfc } from "../../exports.js";
import type {
  CloneableStructure,
  ExtractStructure,
  StructureClassToJSON,
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

export class ClassStaticBlockDeclarationImpl
  extends ClassStaticBlockDeclarationStructureBase
  implements ClassStaticBlockDeclarationStructureClassIfc
{
  readonly kind: StructureKind.ClassStaticBlock =
    StructureKind.ClassStaticBlock;

  /**
   * Create a `ClassStaticBlockDeclarationImpl` from a `ClassStaticBlockDeclarationStructure`.
   * @param source - The structure to clone.
   */
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
