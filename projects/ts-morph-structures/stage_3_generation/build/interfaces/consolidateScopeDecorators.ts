import {
  getClassInterfaceName
} from "#utilities/source/StructureNameTransforms.js";
import InterfaceModule from "../../moduleClasses/InterfaceModule.js";

export default function consolidateScopeDecorators(): void
{
  const oldDecorator = "ScopeableNodeStructure"
  for (const str of InterfaceModule.structuresMap.values()) {
    if (str.extendsSet.has(oldDecorator)) {
      str.extendsSet.add("ScopedNodeStructure");
      str.extendsSet.delete(oldDecorator);
    }
  }

  for (const dec of InterfaceModule.decoratorsMap.values()) {
    if (dec.extendsSet.has(oldDecorator)) {
      dec.extendsSet.add("ScopedNodeStructure");
      dec.extendsSet.delete(oldDecorator);
    }
  }

  InterfaceModule.decoratorsMap.delete(getClassInterfaceName(oldDecorator));
}
