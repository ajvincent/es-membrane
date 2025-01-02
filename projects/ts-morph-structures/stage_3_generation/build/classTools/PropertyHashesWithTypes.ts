const PropertyHashesWithTypesInternal: ReadonlySet<string> = new Set<string>([
  "ClassDeclarationStructure:extends",
  "ClassDeclarationStructure:implements",
  "IndexSignatureDeclarationStructure:keyType",
  "InterfaceDeclarationStructure:extends",
  "ReturnTypedNodeStructure:returnType",
  "TypedNodeStructure:type",
  "TypeParameterDeclarationStructure:constraint",
  "TypeParameterDeclarationStructure:default",
]);

const PropertyHashesWithTypes = {
  has(moduleName: string, fieldName: string): boolean {
    return PropertyHashesWithTypesInternal.has(moduleName + ":" + fieldName);
  }
}

export default PropertyHashesWithTypes;
