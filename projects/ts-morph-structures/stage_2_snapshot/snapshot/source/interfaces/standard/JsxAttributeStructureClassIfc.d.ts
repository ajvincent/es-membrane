import type { JsxNamespacedNameStructure, StructureKind } from "ts-morph";

export interface JsxAttributeStructureClassIfc {
  readonly kind: StructureKind.JsxAttribute;
  initializer?: string;
  name: JsxNamespacedNameStructure | string;
}
