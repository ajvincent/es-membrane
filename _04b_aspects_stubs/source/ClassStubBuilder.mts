// #region preamble
import {
  SourceFile,
  StructureKind,
  TypeNode,
} from "ts-morph";

import {
  ClassDeclarationImpl,
  IndexSignatureDeclarationImpl,
  InterfaceDeclarationImpl,
  LiteralTypedStructureImpl,
  MethodDeclarationImpl,
  ObjectLiteralTypedStructureImpl,
  PropertyDeclarationImpl,
  TypeAliasDeclarationImpl,
  TypeArgumentedTypedStructureImpl,
  TypeParameterDeclarationImpl,
  TypeStructureKind,
  TypeStructures,
  getTypeAugmentedStructure,
} from "#ts-morph_structures/exports.mjs";

import resolveIndexSignatures from "./resolveIndexSignatures.mjs";
// #endregion preamble

type InterfaceOrTypeAlias = InterfaceDeclarationImpl | TypeAliasDeclarationImpl;
type TypeElementMembered = InterfaceDeclarationImpl | ObjectLiteralTypedStructureImpl;

/**
 * An utility for creating stub classes!
 *
 * @example
 * ```
 * const builder = new ClassStubBuilder(sourceFile, interfaceName, className);
 * const classDecl = builder.createClassStub();
 * ```
 */
export default class ClassStubBuilder
{
  /** Type parameters to apply to the stub class. */
  readonly classTypeParameters: TypeParameterDeclarationImpl[] = [];

  /** Type arguments for the interface or type alias's type parameters. */
  readonly typeArguments: TypeStructures[] = [];

  /** When something goes wrong in creating type structures, this will have the failures.  */
  readonly structureConversionFailures: [string, TypeNode][] = [];

  /**
   * Get a list of names matching an index signature (`[key: string]: boolean`).
   *
   * This is a callback you define for object literals with index structures, if necessary.
   *
   * @param signature - the index signature.
   * @returns the names to create new methods and properties for the index signature.
   */
  indexNameResolver?: (
    (this: void, signature: IndexSignatureDeclarationImpl) => string[]
  );

  /**
   * Get an object literal typed structure from within a type alias declaration's type node.
   *
   * This is a callback you define when your type alias isn't to an object literal, but contains one you want.
   *
   * @param alias - the type alias declaration.
   * @returns a descendant of the type alias's type node.
   */
  resolveTypeAliasStructure?: (
    (this: void, alias: TypeAliasDeclarationImpl) => ObjectLiteralTypedStructureImpl
  );

  readonly className: string;
  readonly sourceFile: SourceFile;
  readonly interfaceOrAliasName: string;

  /**
   * @param sourceFile - the source file containing the interface or type alias.
   * @param interfaceOrAliasName - the name of the interface or type alias to extract.
   * @param className - the name of the class.
   */
  constructor(
    sourceFile: SourceFile,
    interfaceOrAliasName: string,
    className: string,
  )
  {
    this.sourceFile = sourceFile;
    this.interfaceOrAliasName = interfaceOrAliasName;
    this.className = className;
  }

  /** Build the class declaration. */
  createClassStub(): ClassDeclarationImpl
  {
    this.structureConversionFailures.splice(0, this.structureConversionFailures.length);

    const interfaceOrAliasStructure: InterfaceOrTypeAlias = this.#getInterfaceOrTypeAlias();
    const membered: TypeElementMembered = this.#buildTypeElementMembered(interfaceOrAliasStructure);
    return this.#buildStubClass(membered);
  }

  /** Get the interface declaration or type alias declaration, with some brief sanity checks.  */
  #getInterfaceOrTypeAlias(): InterfaceOrTypeAlias
  {
    let interfaceOrAliasStructure: InterfaceOrTypeAlias;
    const interfaceNode = this.sourceFile.getInterface(this.interfaceOrAliasName);
    if (interfaceNode) {
      interfaceOrAliasStructure = getTypeAugmentedStructure(
        interfaceNode, this.#userConsole.bind(this)
      ).rootStructure as InterfaceDeclarationImpl;
    }
    else {
      const aliasNode = this.sourceFile.getTypeAliasOrThrow(this.interfaceOrAliasName);

      interfaceOrAliasStructure = getTypeAugmentedStructure(
        aliasNode, this.#userConsole.bind(this)
      ).rootStructure as TypeAliasDeclarationImpl;
    }

    if (this.structureConversionFailures.length)
      throw new Error("structure conversion failure detected: see this.structureConversionFailures");

    if (this.typeArguments.length > interfaceOrAliasStructure.typeParameters.length) {
      throw new Error("too many type arguments for the interface or type alias's type parameters");
    }

    interfaceOrAliasStructure.typeParameters.forEach((sourceTypeParam, index) => {
      if (typeof sourceTypeParam === "string") {
        console.log("sourceTypeParam string: " + sourceTypeParam);
        return;
      }

      if ((index >= this.typeArguments.length) && !sourceTypeParam.defaultStructure) {
        throw new Error(`no context type argument and no default structure for type parameter '${sourceTypeParam.name}'`);
      }
    });

    return interfaceOrAliasStructure;
  }

  #userConsole(
    message: string,
    failingTypeNode: TypeNode,
  ): void
  {
    this.structureConversionFailures.push([message, failingTypeNode]);
  }

  /** Create a `TypeElementMemberedNodeStructure` with the index signatures and type parameters resolved. */
  #buildTypeElementMembered(
    interfaceOrAliasStructure: InterfaceOrTypeAlias
  ): TypeElementMembered
  {
    let membered: TypeElementMembered;
    if (interfaceOrAliasStructure.kind === StructureKind.Interface) {
      membered = InterfaceDeclarationImpl.clone(interfaceOrAliasStructure);
      membered.typeParameters.splice(0, membered.typeParameters.length);
    }
    else {
      const { typeStructure } = interfaceOrAliasStructure;
      if (typeStructure instanceof ObjectLiteralTypedStructureImpl)
        membered = typeStructure;
      else if  (this.resolveTypeAliasStructure) {
        membered = this.resolveTypeAliasStructure(interfaceOrAliasStructure);
      }
      else {
        throw new Error("alias node does not wrap a type literal.  I need a resolveTypeAliasStructure callback to get you an object literal.");
      }

      membered = ObjectLiteralTypedStructureImpl.clone(membered);
    }

    if (membered.callSignatures.length) {
      throw new Error("I cannot generate a class from call signatures!");
    }
    if (membered.constructSignatures.length) {
      throw new Error("I cannot generate a class from construct signatures!");
    }

    if (membered.indexSignatures.length) {
      if (!this.indexNameResolver)
        throw new Error("I cannot generate a class from index signatures without an index name resolver.");
      membered = resolveIndexSignatures(membered, this.indexNameResolver);
    }

    interfaceOrAliasStructure.typeParameters.forEach((sourceTypeParam, index) => {
      let sourceParamName: string;
      if (typeof sourceTypeParam === "string")
        sourceParamName = sourceTypeParam;
      else
        sourceParamName = sourceTypeParam.name;

      let replacement: TypeStructures;
      if (index < this.typeArguments.length)
        replacement = this.typeArguments[index];
      else if (typeof sourceTypeParam === "string")
        replacement = new LiteralTypedStructureImpl(sourceTypeParam);
      else
        replacement = sourceTypeParam.defaultStructure!;

      membered.replaceDescendantTypes(
        typeStructure => (
          (typeStructure.kind === TypeStructureKind.Literal) && (typeStructure.stringValue === sourceParamName)
        ),
        replacement
      );
    });

    return membered;
  }

  /** Convert type-element-membered signatures into a class declaration. */
  #buildStubClass(
    membered: TypeElementMembered
  ): ClassDeclarationImpl
  {
    const classDecl = new ClassDeclarationImpl;
    classDecl.name = this.className;
    classDecl.typeParameters.push(...this.classTypeParameters.map(
      typeParameter => TypeParameterDeclarationImpl.clone(typeParameter)
    ));

    let implementsType: (
      LiteralTypedStructureImpl | TypeArgumentedTypedStructureImpl
    ) = new LiteralTypedStructureImpl(this.interfaceOrAliasName);

    if (this.typeArguments.length) {
      implementsType = new TypeArgumentedTypedStructureImpl(implementsType, this.typeArguments.slice());
    }
    classDecl.implementsSet.add(implementsType);

    membered.properties.forEach(signature => {
      classDecl.properties.push(PropertyDeclarationImpl.fromSignature(signature));
    });

    membered.methods.forEach(signature => {
      classDecl.methods.push(MethodDeclarationImpl.fromSignature(signature));
    });

    return classDecl;
  }
}
