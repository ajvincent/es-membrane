import type { KindedStructure, Structure, StructureKind, Node } from "ts-morph";
import StructureClassesMap from "../../base/StructureClassesMap.js";
import { BaseStructureAndNodeData } from "./Base.js";
import type { StructureImpls } from "../../types/StructureImplUnions.js";

export class AugmentedStructureAndNodeData extends BaseStructureAndNodeData {
  declare protected rootStructure: StructureImpls | null;

  declare readonly structureToNodeMap: Map<StructureImpls, Node>;

  protected upgradeRoot(rootStructure: Structure): StructureImpls {
    return StructureClassesMap.get(
      (rootStructure as KindedStructure<StructureKind>).kind,
    )!.clone(rootStructure);
  }
}
