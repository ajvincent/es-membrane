export function getClassInterfaceName(name: string): string {
  return name + "ClassIfc";
}

export function getStructureClassBaseName(name: string): string {
  return name + "Base";
}

export function getStructureImplName(name: string): string {
  return name.replace(/Structure$/, "Impl");
}

export function getStructureMixinName(name: string): string {
  return name.replace(/Structure$/, "StructureMixin");
}

export function getUnionOfStructuresName(name: string): string {
  return name.replace(/Structures$/, "StructureImpls");
}

export function getStructureNameFromModified(name: string): string {
  return name.replace(/((ClassIfc)|(Base)|(Mixin))$/, "")
             .replace(/Impl$/, "Structure")
             .replace(/StructureImpls$/, "Structures");
}
