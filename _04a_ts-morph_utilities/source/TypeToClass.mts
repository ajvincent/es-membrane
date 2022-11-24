import ts from "ts-morph";
/*
import CodeBlockWriter from "code-block-writer";
*/

export type InterfaceOrTypeAlias = ts.InterfaceDeclaration | ts.TypeAliasDeclaration;
export type FieldDeclaration = ts.MethodDeclaration | ts.PropertyDeclaration;

export type TypeToClassCallback = (
  classNode: ts.ClassDeclaration,
  propertyName: string,
  propertyNode: FieldDeclaration,
  baseNode: InterfaceOrTypeAlias,
) => boolean;

/**
 *
 * @param statements - the code to insert on every method.
 * @returns the callback
 */
function buildStatementsCallback(
  statements: string
) : TypeToClassCallback
{
  return (
    classNode,
    propertyName,
    propertyNode,
    baseNode,
  ) : true =>
  {
    void(baseNode);
    if (ts.Node.isMethodDeclaration(propertyNode)) {
      propertyNode.addStatements(statements);
    }
    else {
      const returnType = propertyNode.getTypeNodeOrThrow().getText();
  
      propertyNode.remove();

      classNode.addGetAccessor({
        name: propertyName,
        statements,
        returnType,
      });

      classNode.addSetAccessor({
        name: propertyName,
        parameters: [{
          name: "value",
          type: returnType
        }],
        statements
      });
    }
  
    return true;
  }
}

export default class TypeToClass
{
  #destFile: ts.SourceFile;
  #targetClass: ts.ClassDeclaration;
  #callback: TypeToClassCallback;

  /**
   * @param destFile  - The destination file, which must be empty.
   * @param className - The name of the class to create.
   * @param callback  - The callback to define the contents of a field.
   */
  constructor(
    destFile: ts.SourceFile,
    className: string,
    callback: TypeToClassCallback,
  )
  {
    if (destFile.getStatements().length > 0)
      throw new Error("Destination file must be empty!");

    this.#destFile = destFile;
    this.#callback = callback;

    destFile.insertStatements(0, `
/* This is generated code.  Do not edit directly.
   Instead, edit the types this file imports.
*/
    `.trim());

    this.#targetClass = destFile.addClass({
      name: className,
      isDefaultExport: true,
      isExported: true,
    });
  }

  static notImplementedCallback: TypeToClassCallback = buildStatementsCallback(
    `throw new Error("not yet implemented");`
  );

  static buildStatementsCallback = buildStatementsCallback;

  /*
  #writer = new CodeBlockWriter({
    indentNumberOfSpaces: 2,
  });
  */

  /**
   * Add a type from a source file.  This will invoke the user's callback for members of that type.
   *
   * @param sourceFile - The source file.
   * @param typeName   - The type to extract.
   */
  addTypeAliasOrInterface(
    sourceFile: ts.SourceFile,
    typeName: string
  ) : void
  {
    const firstTypeNode = this.#extractFirstTypeNode(sourceFile, typeName);
    const type = firstTypeNode.getType();

    if (type.getUnionTypes().length)
      throw new Error("You cannot add a type which is a union of two or more types!  (How should I know which type to support?)");

    const fields = type.getProperties();
    if (fields.length === 0)
      throw new Error("No properties to add?");

    const allFieldsMap = new Map<string, string>;
    fields.forEach(field => this.#fillFieldsMap(firstTypeNode, field, allFieldsMap));

    const fullText = Array.from(allFieldsMap.values()).join("\n\n") + "\n";
    const pos = this.#targetClass.getEnd() - 1;
    this.#targetClass.insertText(pos, fullText);

    /** @see {@link https://ts-morph.com/manipulation/#strongwarningstrong} */
    this.#targetClass = this.#destFile.getClass(
      this.#targetClass.getName() as string
    ) as ts.ClassDeclaration;

    const acceptedFields = new Set<string>;

    for (const field of allFieldsMap.keys()) {
      this.#modifyField(firstTypeNode, field, acceptedFields);
    }

    if (acceptedFields.size === 0)
      throw new Error(`For type ${typeName}, no properties or methods were accepted!`);
    if (acceptedFields.size === allFieldsMap.size)
      this.#targetClass.addImplements(typeName);
    else {
      this.#targetClass.addImplements(`Pick<${typeName}, ${
        Array.from(acceptedFields.values()).map(v => `"${v}"`).join(" | ")
      }>`);
    }

    this.#addTypeImport(sourceFile, typeName);
  }

  /**
   * Extract the type alias or interface nodes for a given type.
   *
   * @param sourceFile - The source file.
   * @param typeName   - The type to extract.
   * @returns an interface or type alias node.
   */
  #extractFirstTypeNode(
    sourceFile: ts.SourceFile,
    typeName: string,
  ) : InterfaceOrTypeAlias
  {
    let firstBaseNode: InterfaceOrTypeAlias | undefined;
    firstBaseNode = sourceFile.getTypeAlias(typeName);
    if (!firstBaseNode)
      firstBaseNode = sourceFile.getInterface(typeName);

    if (!firstBaseNode)
      throw new Error(`No interface or type alias found for type name "${typeName}"!`);

    if (!firstBaseNode.isExported())
      throw new Error("Base node must be exported for the destination file to import it!");

    return firstBaseNode;
  }

  /**
   * Add a field to a cache map of the class's source.
   *
   * @param firstTypeNode - The first TS node to define the type.
   * @param field         - The symbol identifying the field.
   * @param allFieldsMap  - A cache for source code snippets of the class.
   *                        Keys represent the field as a string.
   *                        Values are the initial code snippets.
   */
  #fillFieldsMap(
    firstTypeNode: InterfaceOrTypeAlias,
    field: ts.Symbol,
    allFieldsMap: Map<string, string>
  ) : void
  {
    // Symbol keys appear at the end of the fully qualified name.
    const fullName = field.getFullyQualifiedName();
    const name = fullName.substring(fullName.lastIndexOf(".") + 1);

    const typeAtNode = field.getTypeAtLocation(firstTypeNode);

    let text = typeAtNode.getText(
      undefined,
      ts.TypeFormatFlags.NodeBuilderFlagsMask
    );

    if ((field.getFlags() & ts.SymbolFlags.Method)) {
      // ts-morph, or more likely TypeScript itself, writes arrow function types, but specifies methods:
      // " => returnType" versus " : returnType".
      const signatures = typeAtNode.getCallSignatures();
      if (signatures.length > 1) {
        /* From the TypeScript Handbook
        https://www.typescriptlang.org/docs/handbook/2/functions.html#function-overloads
        function len(s: string): number;
        function len(arr: any[]): number;
        function len(x: any) {
          return x.length;
        }

        I think that's what ts-morph is referring to...
        */

        throw new Error("TypeToClass in cross-stitch does not know how to fix method printouts with multiple call signatures.  Please file a bug.");
      }

      const returnType = signatures[0].getReturnType().getText();
      const beforeReturn = text.substring(0, text.length - returnType.length);
      text = `    ${name}${
        beforeReturn.replace(/ => $/, " : ")
      }${returnType}\n    {\n    }`;
    }
    else {
      text = `    ${name}: ${text}`;
    }

    allFieldsMap.set(name, text);
  }

  /**
   * Invoke the user callback, and clean up resulting code, for a field.
   *
   * @param firstTypeNode  - The first TS node to define the type.
   * @param field          - The name of the field to pass to the user callback.
   * @param acceptedFields - The current list of accepted fields for the class.
   */
  #modifyField(
    firstTypeNode: InterfaceOrTypeAlias,
    field: string,
    acceptedFields: Set<string>,
  ) : void
  {
    const child = this.#targetClass.getMember(field);

    if (!ts.Node.isMethodDeclaration(child) && !ts.Node.isPropertyDeclaration(child))
      throw new Error("assertion failure: we should have a property or a method now");

    const result = this.#callback(this.#targetClass, field, child, firstTypeNode);
    this.#targetClass = this.#destFile.getClass(
      this.#targetClass.getName() as string
    ) as ts.ClassDeclaration;

    if (result) {
      acceptedFields.add(field);
      this.#voidUnusedParameters(field);
    }
    else {
      child.remove();
    }
  }

  /**
   * Ensure unused parameters pass eslint by adding void() statements.
   *
   * @param fieldName - The name of the field.
   */
  #voidUnusedParameters(
    fieldName: string
  ) : void
  {
    type MethodType = ts.MethodDeclaration | ts.SetAccessorDeclaration;
    let method: MethodType | undefined = this.#targetClass.getInstanceMethod(fieldName);
    if (!method)
      method = this.#targetClass.getSetAccessor(fieldName);
    if (!method)
      return;
  
    const found = new Set<string>;
    {
      const body = method.getBodyOrThrow();
      const descendantIdentifiers = body.getDescendantsOfKind(ts.SyntaxKind.Identifier);
      descendantIdentifiers.forEach(id => found.add(id.getText()));
    }

    const parameters = method.getParameters().slice().reverse();
    parameters.forEach(p => {
      const id = p.getName();
      if (!found.has(id)) {
        (method as MethodType).insertStatements(0, `void(${id});`);
      }
    });
  }

  #importDeclarations = new WeakMap<ts.SourceFile, ts.ImportDeclaration>;

  /**
   * Add a type import for the target file.
   *
   * @param sourceFile - The source file.
   * @param typeName   - The type to import.
   */
  #addTypeImport(
    sourceFile: ts.SourceFile,
    typeName: string
  ) : void
  {
    // https://github.com/dsherret/ts-morph/issues/613#issuecomment-607860679

    const decl = this.#importDeclarations.get(sourceFile);
    if (!decl) {
      let moduleSpecifier = this.#destFile.getRelativePathAsModuleSpecifierTo(sourceFile);
      if (!moduleSpecifier.endsWith(".mjs"))
        moduleSpecifier += ".mjs";

      this.#importDeclarations.set(sourceFile,
        this.#destFile.addImportDeclaration({
          namedImports: [typeName],
          moduleSpecifier
        })
      );
    }
    else {
      decl.addNamedImport(typeName);
    }

    this.#destFile.fixMissingImports();
  }
}
