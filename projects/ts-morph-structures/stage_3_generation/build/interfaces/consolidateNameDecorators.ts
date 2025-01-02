import {
  getClassInterfaceName
} from "#utilities/source/StructureNameTransforms.js";

import InterfaceModule from "../../moduleClasses/InterfaceModule.js";

export default function consolidateNameDecorators(): void
{
  for (const oldDecorator of [
    "AssertionKeyNamedNodeStructure",
    "BindingNamedNodeStructure",
    "ImportAttributeNamedNodeStructure",
    "JsxTagNamedNodeStructure",
    "ModuleNamedNodeStructure",
    "PropertyNamedNodeStructure",
  ]) {
    for (const str of InterfaceModule.structuresMap.values()) {
      if (str.extendsSet.has(oldDecorator)) {
        str.extendsSet.add("NamedNodeStructure");
        str.extendsSet.delete(oldDecorator);
      }
    }

    for (const dec of InterfaceModule.decoratorsMap.values()) {
      if (dec.extendsSet.has(oldDecorator)) {
        dec.extendsSet.add("NamedNodeStructure");
        dec.extendsSet.delete(oldDecorator);
      }
    }

    InterfaceModule.decoratorsMap.delete(getClassInterfaceName(oldDecorator));

    {
      const str = InterfaceModule.structuresMap.get(getClassInterfaceName("ClassDeclarationStructure"))!;
      str.extendsSet.add("NameableNodeStructure");
      str.typeMembers.delete("name");
    }

    for (const structureName of [
      "DecoratorStructure",
      "ExportSpecifierStructure",
      "ImportSpecifierStructure",
      "JsxElementStructure",
    ]) {
      const str = InterfaceModule.structuresMap.get(getClassInterfaceName(structureName))!;
      str.extendsSet.add("NamedNodeStructure");
      str.typeMembers.delete("name");
    }
  }
}
