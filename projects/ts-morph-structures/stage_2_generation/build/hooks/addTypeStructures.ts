import {
  CodeBlockWriter,
  Scope,
  StructureKind,
} from "ts-morph";

import StructureDictionaries, {
  DecoratorParts,
  StructureParts,
} from "#stage_two/generation/build/StructureDictionaries.js";

import {
  DecoratorImplMeta,
  PropertyName,
  PropertyValue,
  StructureImplMeta,
} from "#stage_two/generation/build/structureMeta/DataClasses.js";

import {
  GetAccessorDeclarationImpl,
  LiteralTypedStructureImpl,
  JSDocImpl,
  JSDocTagImpl,
  type ConstructorDeclarationImpl,
  MethodDeclarationImpl,
  ParameterDeclarationImpl,
  PropertyDeclarationImpl,
  PropertySignatureImpl,
  SetAccessorDeclarationImpl,
  TypeArgumentedTypedStructureImpl,
  UnionTypedStructureImpl,
} from "#stage_one/prototype-snapshot/exports.js";

import ConstantTypeStructures from "../utilities/ConstantTypeStructures.js";
import ClassFieldStatementsMap from "../utilities/public/ClassFieldStatementsMap.js";
import ClassMembersMap from "../utilities/public/ClassMembersMap.js";
import pairedWrite from "../utilities/pairedWrite.js";
import {
  COPY_FIELDS_NAME,
  STRUCTURE_AND_TYPES_CHILDREN_NAME,
} from "../constants.js";

export default function addTypeStructures(
  name: string,
  meta: DecoratorImplMeta | StructureImplMeta,
  dictionaries: StructureDictionaries
): void
{
  let parts: DecoratorParts | StructureParts;
  if (meta instanceof DecoratorImplMeta) {
    parts = dictionaries.decoratorParts.get(meta)!;
  } else {
    parts = dictionaries.structureParts.get(meta)!;
  }

  meta.structureFieldArrays.forEach((propertyValue, propertyKey) => {
    if (propertyValue.representsType) {
      addTypeStructureSet(dictionaries, parts, propertyValue, propertyKey);
    }
  });

  meta.structureFields.forEach((propertyValue, propertyKey) => {
    if (propertyValue.representsType) {
      addTypeAccessor(dictionaries, parts, propertyValue, propertyKey);
    }
  });
}

function addTypeStructureSet(
  dictionaries: StructureDictionaries,
  parts: DecoratorParts | StructureParts,
  propertyValue: PropertyValue,
  propertyKey: PropertyName
): void
{
  parts.importsManager.addImports({
    pathToImportedModule: dictionaries.internalExports.absolutePathToExportFile,
    isPackageImport: false,
    importNames: [
      "ReadonlyArrayProxyHandler",
      "TypeStructureSetInternal"
    ],
    isDefaultImport: false,
    isTypeOnly: false
  });

  const existingProperty = parts.classMembersMap.getAsKind(propertyKey, StructureKind.Property)!;
  parts.classMembersMap.delete(propertyKey);

  const staticProxyHandlerProp = new PropertyDeclarationImpl(`#${propertyKey}ArrayReadonlyHandler`);
  staticProxyHandlerProp.isStatic = true;
  staticProxyHandlerProp.isReadonly = true;
  parts.classFieldsStatements.set(
    ClassMembersMap.keyFromMember(staticProxyHandlerProp),
    ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY,
    [
      `new ReadonlyArrayProxyHandler("The ${propertyKey} array is read-only.  ` +
      `Please use this.${propertyKey}Set to set strings and type structures.")`
    ]
  );

  const shadowArrayProp = new PropertyDeclarationImpl(`#${propertyKey}_ShadowArray`);
  shadowArrayProp.isReadonly = true;
  shadowArrayProp.typeStructure = ConstantTypeStructures["stringOrWriterFunction[]"];
  parts.classFieldsStatements.set(
    ClassMembersMap.keyFromMember(shadowArrayProp),
    ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY,
    ["[]"]
  );

  const proxyArrayProp = new PropertyDeclarationImpl(`#${propertyKey}ProxyArray`);
  proxyArrayProp.isReadonly = true;
  proxyArrayProp.typeStructure = ConstantTypeStructures["stringOrWriterFunction[]"];
  parts.classFieldsStatements.set(
    ClassMembersMap.keyFromMember(proxyArrayProp),
    ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY,
    [
      (writer: CodeBlockWriter): void => {
        writer.write("new Proxy");
        pairedWrite(
          writer, "<", ">", false, false,
          () => ConstantTypeStructures["stringOrWriterFunction[]"].writerFunction(writer)
        );
        pairedWrite(
          writer, "(", ")", false, true, () => {
            writer.writeLine(`this.${shadowArrayProp.name},`);
            writer.writeLine(`${parts.classDecl.name!}.${staticProxyHandlerProp.name}`);
          }
        );
      }
    ]
  );

  const typeGetter = new GetAccessorDeclarationImpl(propertyKey);
  typeGetter.leadingTrivia.push(`// overridden in constructor\n`);
  typeGetter.returnTypeStructure = existingProperty.typeStructure;
  parts.classFieldsStatements.set(
    ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN,
    ClassMembersMap.keyFromMember(typeGetter),
    [`throw new Error("not implemented);`]
  );

  const ctor: ConstructorDeclarationImpl = parts.classMembersMap.getOrInsertConstructor();
  const ctorKey: string = ClassMembersMap.keyFromMember(ctor);

  if (!parts.classFieldsStatements.has(ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL, ctorKey)) {
    parts.classFieldsStatements.set(
      ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL,
      ctorKey,
      ["super();"]
    );
  }

  parts.classFieldsStatements.set(
    typeGetter.name,
    ctorKey,
    [
      `// ${propertyKey} is getting lost in ts-morph clone operations`,
      `const ${propertyKey}ProxyArray: stringOrWriterFunction[] = this.#${propertyKey}ProxyArray;`,
      `Reflect.defineProperty(this, "${propertyKey}", {
        configurable: false,
        enumerable: true,
        get: function(): stringOrWriterFunction[] {
          return ${propertyKey}ProxyArray;
        }
      });`,
    ]
  );

  const typeStructureSetProp = new PropertyDeclarationImpl(`${propertyKey}Set`);
  typeStructureSetProp.isReadonly = true;
  typeStructureSetProp.typeStructure = ConstantTypeStructures.TypeStructureSet;
  parts.classFieldsStatements.set(
    ClassMembersMap.keyFromMember(typeStructureSetProp),
    ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY,
    [
      `new TypeStructureSetInternal(this.${shadowArrayProp.name})`
    ]
  );

  parts.classFieldsStatements.set(
    ClassMembersMap.keyFromMember(existingProperty),
    COPY_FIELDS_NAME,
    [
      (writer: CodeBlockWriter): void => {
        writer.write(`const { ${typeStructureSetProp.name} } = (source as unknown as ${parts.classDecl.name!});`)
        writer.write(`if (${typeStructureSetProp.name} instanceof TypeStructureSetInternal)`);
        writer.block(() => {
          writer.write(`target.${typeStructureSetProp.name}.cloneFromTypeStructureSet(${typeStructureSetProp.name});`)
        });
        writer.write(`else if (Array.isArray(source.${propertyKey})) `);
        writer.block(() => {
          writer.write(`target.${typeStructureSetProp.name}.replaceFromTypeArray(source.${propertyKey});`);
        });
        writer.write(`else if (typeof source.${propertyKey} === "function") `);
        writer.block(() => {
          writer.write(`target.${typeStructureSetProp.name}.replaceFromTypeArray([source.${propertyKey}]);`);
        });
      }
    ]
  );

  defineStructureAndTypesChildren(dictionaries, parts, typeStructureSetProp.name, true);

  parts.classMembersMap.addMembers([
    staticProxyHandlerProp,
    shadowArrayProp,
    proxyArrayProp,
    typeGetter,
    typeStructureSetProp,
  ]);

  // add the necessary interface to the class
  const typeProperty = new PropertySignatureImpl(typeStructureSetProp.name);
  typeProperty.typeStructure = ConstantTypeStructures.TypeStructureSet;
  typeProperty.isReadonly = true;
  parts.classImplementsMap.addMembers([typeProperty]);

  const originalTypeArraySignature = parts.classImplementsMap.getAsKind<StructureKind.PropertySignature>(
    propertyKey, StructureKind.PropertySignature
  )!;
  originalTypeArraySignature.isReadonly = true;

  const typeDocs = new JSDocImpl();
  originalTypeArraySignature.docs.push(typeDocs);
  typeGetter.docs.push(typeDocs);
  typeDocs.description = `Treat this as a read-only array.  Use \`.${typeStructureSetProp.name}\` to modify this.`;

  parts.implementsImports.addImports({
    pathToImportedModule: dictionaries.publicExports.absolutePathToExportFile,
    isPackageImport: false,
    isDefaultImport: false,
    isTypeOnly: true,
    importNames: ["TypeStructureSet"]
  });

  parts.importsManager.addImports({
    pathToImportedModule: dictionaries.publicExports.absolutePathToExportFile,
    isPackageImport: false,
    isDefaultImport: false,
    isTypeOnly: true,
    importNames: ["TypeStructureSet"]
  });
}

function addTypeAccessor(
  dictionaries: StructureDictionaries,
  parts: DecoratorParts | StructureParts,
  propertyValue: PropertyValue,
  propertyKey: PropertyName
): void
{
  parts.importsManager.addImports({
    pathToImportedModule: dictionaries.internalExports.absolutePathToExportFile,
    isPackageImport: false,
    importNames: ["TypeAccessors"],
    isDefaultImport: false,
    isTypeOnly: false
  });

  parts.importsManager.addImports({
    pathToImportedModule: dictionaries.publicExports.absolutePathToExportFile,
    isPackageImport: false,
    importNames: ["TypeStructures"],
    isDefaultImport: false,
    isTypeOnly: true
  });

  const existingProperty = parts.classMembersMap.getAsKind(propertyKey, StructureKind.Property)!;
  existingProperty.leadingTrivia.push(`// overridden in constructor\n`);
  if (propertyValue.hasQuestionToken && existingProperty.typeStructure) {
    existingProperty.typeStructure = new UnionTypedStructureImpl([
      existingProperty.typeStructure,
      ConstantTypeStructures.undefined
    ]);
  }

  const typeAccessorProp = new PropertyDeclarationImpl(`#${propertyKey}Accessors`);
  typeAccessorProp.isReadonly = true;
  typeAccessorProp.typeStructure = new LiteralTypedStructureImpl("TypeAccessors");

  const ctor: ConstructorDeclarationImpl = parts.classMembersMap.getOrInsertConstructor();
  const ctorKey: string = ClassMembersMap.keyFromMember(ctor);

  if (!parts.classFieldsStatements.has(ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL, ctorKey)) {
    parts.classFieldsStatements.set(
      ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL,
      ctorKey,
      ["super();"]
    );
  }

  parts.classFieldsStatements.set(
    typeAccessorProp.name,
    ctorKey,
    [
      `// ${propertyKey} is getting lost in ts-morph clone operations`,
      `this.${typeAccessorProp.name} = TypeAccessors.buildTypeAccessors(this, "${propertyKey}");`
    ]
  );

  const structureGetAccessor = new GetAccessorDeclarationImpl(propertyKey + "Structure");
  structureGetAccessor.returnTypeStructure = ConstantTypeStructures.TypeStructures_Undefined;

  const structureSetAccessor = new SetAccessorDeclarationImpl(propertyKey + "Structure");
  {
    const value = new ParameterDeclarationImpl("value");
    value.typeStructure = ConstantTypeStructures.TypeStructures_Undefined;
    structureSetAccessor.parameters.push(value);
  }

  parts.classFieldsStatements.set(
    ClassMembersMap.keyFromMember(structureGetAccessor),
    ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY,
    [ `this.${typeAccessorProp.name}.typeStructure` ]
  );

  parts.importsManager.addImports({
    pathToImportedModule: dictionaries.internalExports.absolutePathToExportFile,
    isPackageImport: false,
    importNames: ["TypeStructureClassesMap"],
    isDefaultImport: false,
    isTypeOnly: false
  });

  const existingStatements = parts.classFieldsStatements.get(
    propertyKey,
    COPY_FIELDS_NAME
  )!;
  existingStatements[0] = `if (${propertyKey}Structure) {\n` +
    `target.${propertyKey}Structure = TypeStructureClassesMap.clone(${propertyKey}Structure);\n` +
  `} else ${existingStatements[0] as string}`;
  existingStatements.unshift(`const { ${propertyKey}Structure } = source as unknown as ${parts.classDecl.name!};`)

  defineStructureAndTypesChildren(dictionaries, parts, propertyKey + "Structure", false);

  parts.classMembersMap.addMembers([
    typeAccessorProp,
    structureGetAccessor,
    structureSetAccessor,
  ]);

  // add the necessary interface to the class
  const typeProperty = new PropertySignatureImpl(structureGetAccessor.name);
  typeProperty.typeStructure = structureGetAccessor.returnTypeStructure;
  parts.classImplementsMap.addMembers([typeProperty]);

  parts.implementsImports.addImports({
    pathToImportedModule: dictionaries.publicExports.absolutePathToExportFile,
    isPackageImport: false,
    isDefaultImport: false,
    isTypeOnly: true,
    importNames: ["TypeStructures"]
  });
}

/* public * [STRUCTURE_AND_TYPES_CHILDREN](): IterableIterator<StructureImpls | TypeStructures> */
function defineStructureAndTypesChildren(
  dictionaries: StructureDictionaries,
  parts: DecoratorParts | StructureParts,
  fieldName: string,
  isSet: boolean
): MethodDeclarationImpl {
  const statements: string[] = [];
  parts.classFieldsStatements.set(fieldName, STRUCTURE_AND_TYPES_CHILDREN_NAME, statements);
  if (isSet) {
    statements.push(`for (const typeStructure of this.${fieldName}) { if (typeof typeStructure === "object") yield typeStructure; }`);
  } else {
    statements.push(`if (typeof this.${fieldName} === "object") yield this.${fieldName};`);
  }

  if (parts.classMembersMap.has(STRUCTURE_AND_TYPES_CHILDREN_NAME) === false) {
    const method = new MethodDeclarationImpl("[STRUCTURE_AND_TYPES_CHILDREN]");
    method.isStatic = false;
    method.isGenerator = true;
    method.scope = Scope.Public;
    method.returnTypeStructure = new TypeArgumentedTypedStructureImpl(
      new LiteralTypedStructureImpl("IterableIterator"),
      [
        new UnionTypedStructureImpl([
          ConstantTypeStructures.StructureImpls,
          ConstantTypeStructures.TypeStructures,
        ])
      ]
    );

    const jsdoc = new JSDocImpl;
    const internalTag = new JSDocTagImpl("internal");
    jsdoc.tags.push(internalTag);
    method.docs.push(jsdoc);

    parts.classMembersMap.addMembers([method]);

    parts.classFieldsStatements.set(
      ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL,
      STRUCTURE_AND_TYPES_CHILDREN_NAME,
      [
        `yield* super[STRUCTURE_AND_TYPES_CHILDREN]();`
      ]
    );

    parts.importsManager.addImports({
      pathToImportedModule: dictionaries.publicExports.absolutePathToExportFile,
      isPackageImport: false,
      importNames: [
        "StructureImpls",
        "TypeStructures",
      ],
      isDefaultImport: false,
      isTypeOnly: true
    });

    parts.importsManager.addImports({
      pathToImportedModule: dictionaries.internalExports.absolutePathToExportFile,
      isPackageImport: false,
      importNames: [
        "STRUCTURE_AND_TYPES_CHILDREN",
      ],
      isDefaultImport: false,
      isTypeOnly: false
    });
  }

  return parts.classMembersMap.get(STRUCTURE_AND_TYPES_CHILDREN_NAME) as MethodDeclarationImpl;
}
