import { getClassInterfaceName } from "#utilities/source/StructureNameTransforms.js";
import InterfaceModule from "../../moduleClasses/InterfaceModule.js";

export default function removeStaticableDecorator(): void {
  const name = "StaticableNodeStructure";
  const staticable = InterfaceModule.decoratorsMap.get(
    getClassInterfaceName(name)
  )!;

  const members = Array.from(staticable.typeMembers.values());

  InterfaceModule.structuresMap.forEach(structureModule => {
    if (structureModule.extendsSet.has(name) === false)
      return;
    structureModule.typeMembers.addMembers(members);
    structureModule.extendsSet.delete(name);
  });

  InterfaceModule.decoratorsMap.delete(
    getClassInterfaceName(name)
  );
}
