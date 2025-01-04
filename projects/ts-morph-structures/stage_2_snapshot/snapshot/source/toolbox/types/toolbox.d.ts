import type { Scope, WriterFunction } from "ts-morph";

import type {
  CallSignatureDeclarationImpl,
  ConstructorDeclarationImpl,
  ConstructSignatureDeclarationImpl,
  GetAccessorDeclarationImpl,
  IndexSignatureDeclarationImpl,
  MethodDeclarationImpl,
  MethodSignatureImpl,
  PropertyDeclarationImpl,
  PropertySignatureImpl,
  SetAccessorDeclarationImpl,
  StatementStructureImpls,
  stringOrWriterFunction,
} from "../../exports.js";

/** A description of the exports to add. */
export interface AddExportContext {
  /** This could be an absolute path, or a package import like "ts-morph-structures". */
  pathToExportedModule: string;

  /** The names to add to the import.  Pass an empty array for "*". */
  exportNames: readonly string[];

  /** True if the import is the default.  exportNames will then be the default export name. */
  isDefaultExport: boolean;

  /** True if the export names are types only. */
  isType: boolean;
}

/** A description of the imports to add. */
export interface AddImportContext {
  /** This could be an absolute path, or a package import like "ts-morph-structures". */
  pathToImportedModule: string;

  /**
   * True if `this.pathToImportedModule` represents a package import.
   * False if the imported module path should be relative to the
   * manager's absolute path in generated code.
   */
  isPackageImport: boolean;

  /** The names to add to the import.  Pass an empty array for "*". */
  importNames: readonly string[];

  /** True if the import is the default.  importNames will then be the default import. */
  isDefaultImport: boolean;

  /** True if the import names are types only. */
  isTypeOnly: boolean;
}

export type ClassFieldStatement =
  | string
  | WriterFunction
  | StatementStructureImpls;

export type ClassMemberImpl =
  | ConstructorDeclarationImpl
  | GetAccessorDeclarationImpl
  | MethodDeclarationImpl
  | PropertyDeclarationImpl
  | SetAccessorDeclarationImpl;

export type NamedClassMemberImpl = Extract<ClassMemberImpl, { name: string }>;

export interface IndexSignatureResolver {
  resolveIndexSignature(signature: IndexSignatureDeclarationImpl): string[];
}

export interface MemberedStatementsKey {
  readonly fieldKey: string;
  readonly statementGroupKey: string;
  readonly purpose: string;

  readonly isFieldStatic: boolean;
  readonly fieldType: TypeMemberImpl | undefined;

  readonly isGroupStatic: boolean;
  readonly groupType: TypeMemberImpl | undefined;
}

export interface ClassAbstractMemberQuestion {
  isAbstract(
    kind: Exclude<ClassMemberImpl, ConstructorDeclarationImpl>["kind"],
    memberName: string,
  ): boolean;
}

export interface ClassAsyncMethodQuestion {
  isAsync(isStatic: boolean, methodName: string): boolean;
}

export interface ClassGeneratorMethodQuestion {
  isGenerator(isStatic: boolean, methodName: string): boolean;
}

export interface ClassScopeMemberQuestion {
  getScope(
    isStatic: boolean,
    kind: ClassMemberImpl["kind"],
    memberName: string,
  ): Scope | undefined;
}

export type NamedTypeMemberImpl = Extract<TypeMemberImpl, { name: string }>;

export type TypeMemberImpl =
  | CallSignatureDeclarationImpl
  | ConstructSignatureDeclarationImpl
  | GetAccessorDeclarationImpl
  | IndexSignatureDeclarationImpl
  | MethodSignatureImpl
  | PropertySignatureImpl
  | SetAccessorDeclarationImpl;

export type stringWriterOrStatementImpl =
  | stringOrWriterFunction
  | StatementStructureImpls;

/**
 * For the initial value of a property.
 *
 * @remarks
 * To run these methods, `this.supportsStatementsFlags & ClassSupportsStatementsFlags.PropertyInitializer` must be non-zero.
 */
export interface PropertyInitializerGetter {
  /**
   * @param key - The property description key.  `statementGroupKey` will be `ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY`.
   * @returns true for a match against the key.
   */
  filterPropertyInitializer(key: MemberedStatementsKey): boolean;

  /**
   * @param key - The property description key.  `statementGroupKey` will be `ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY`.
   * @returns the value to write for the property initializer.
   */
  getPropertyInitializer(
    key: MemberedStatementsKey,
  ): stringWriterOrStatementImpl | undefined;
}

/**
 * A value for getters and setters of a class to reflect.
 *
 * @remarks
 * To run these methods, `this.supportsStatementsFlags & ClassSupportsStatementsFlags.AccessorMirror` must be non-zero.
 */
export interface AccessorMirrorGetter {
  /**
   * @param key - Describing the getter or setter to implement.  `statementGroupKey` will be `ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY`.
   * @returns true for a match against the key.
   */
  filterAccessorMirror(key: MemberedStatementsKey): boolean;

  /**
   * @param key - Describing the getter or setter to implement.  `statementGroupKey` will be `ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY`.
   * @returns the value to write for the getter and/or setter to mirror.
   */
  getAccessorMirror(
    key: MemberedStatementsKey,
  ): stringWriterOrStatementImpl | undefined;
}

/**
 * Statements at the start of a statement purpose block.
 *
 * @remarks
 * To run these methods, `this.supportsStatementsFlags & ClassSupportsStatementsFlags.HeadStatements` must be non-zero.
 */
export interface ClassHeadStatementsGetter {
  /**
   * @param key - The membered statement key.  `fieldKey` will be `ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL`.
   * @returns true for a match against the key.
   */
  filterHeadStatements(key: MemberedStatementsKey): boolean;

  /**
   * @param key - The membered statement key.  `fieldKey` will be `ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL`.
   * @returns statements to insert before other statements in the purpose block.
   */
  getHeadStatements(
    key: MemberedStatementsKey,
  ): readonly stringWriterOrStatementImpl[];
}

/**
 * Statements in a statement purpose block for a particular property and function.
 *
 * @remarks
 * To run these methods, `this.supportsStatementsFlags & ClassSupportsStatementsFlags.BodyStatements` must be non-zero.
 */
export interface ClassBodyStatementsGetter {
  /**
   * @param key - The membered statement key.
   * @returns true for a match against the key.
   */
  filterBodyStatements(key: MemberedStatementsKey): boolean;
  /**
   * @param key - The membered statement key.
   * @returns statements to insert for the given field key and statement group key.
   */
  getBodyStatements(
    key: MemberedStatementsKey,
  ): readonly stringWriterOrStatementImpl[];
}

/**
 * Statements at the end of a statement purpose block.
 *
 * @remarks
 * To run these methods, `this.supportsStatementsFlags & ClassSupportsStatementsFlags.TailStatements` must be non-zero.
 */
export interface ClassTailStatementsGetter {
  /**
   * @param key - The membered statement key.  `fieldKey` will be `ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN`.
   * @returns true for a match against the key.
   */
  filterTailStatements(key: MemberedStatementsKey): boolean;

  /**
   * @param key - The membered statement key.  `fieldKey` will be `ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN`.
   * @returns statements to insert after other statements in the purpose block.
   */
  getTailStatements(
    key: MemberedStatementsKey,
  ): readonly stringWriterOrStatementImpl[];
}

/**
 * Statements at the start of a constructor's statement purpose block.
 *
 * @remarks
 * To run these methods, `this.supportsStatementsFlags & ClassSupportsStatementsFlags.ConstructorHeadStatements` must be non-zero.
 */
export interface ConstructorHeadStatementsGetter {
  /**
   * @param key - The membered statement key.  `fieldKey` will be `ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL`.  `statementGroupKey` will be "constructor".
   * @returns true for a match against the key.
   */
  filterCtorHeadStatements(key: MemberedStatementsKey): boolean;

  /**
   * @param key - The membered statement key.  `fieldKey` will be `ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL`.  `statementGroupKey` will be "constructor".
   * @returns statements to insert before other statements in the purpose block.
   */
  getCtorHeadStatements(
    key: MemberedStatementsKey,
  ): readonly stringWriterOrStatementImpl[];
}

/**
 * Statements in a statement purpose block for a particular property in the constructor.
 *
 * @remarks
 * To run these methods, `this.supportsStatementsFlags & ClassSupportsStatementsFlags.ConstructorBodyStatements` must be non-zero.
 */
export interface ConstructorBodyStatementsGetter {
  /**
   * @param key - The membered statement key.  `statementGroupKey` will be "constructor".
   * @returns true for a match against the key.
   */
  filterCtorBodyStatements(key: MemberedStatementsKey): boolean;

  /**
   * @param key - The membered statement key.  `statementGroupKey` will be "constructor".
   * @returns statements to insert for the given field key and statement group key.
   */
  getCtorBodyStatements(
    key: MemberedStatementsKey,
  ): readonly stringWriterOrStatementImpl[];
}

/**
 * Statements at the end of a constructor's statement purpose block.
 *
 * @remarks
 * To run these methods, `this.supportsStatementsFlags & ClassSupportsStatementsFlags.ConstructorTailStatements` must be non-zero.
 */
export interface ConstructorTailStatementsGetter {
  /**
   * @param key - The membered statement key.  `fieldKey` will be `ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN`.  `statementGroupKey` will be "constructor".
   * @returns true for a match against the key.
   */
  filterCtorTailStatements(key: MemberedStatementsKey): boolean;

  /**
   * @param key - The membered statement key.  `fieldKey` will be `ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN`.  `statementGroupKey` will be "constructor".
   * @returns statements to insert before other statements in the purpose block.
   */
  getCtorTailStatements(
    key: MemberedStatementsKey,
  ): readonly stringWriterOrStatementImpl[];
}

/**
 * Traps for getting statements, based on a `MemberedStatementsKey`.
 */
export interface ClassStatementsGetter
  extends Partial<PropertyInitializerGetter>,
    Partial<AccessorMirrorGetter>,
    Partial<ClassHeadStatementsGetter>,
    Partial<ClassBodyStatementsGetter>,
    Partial<ClassTailStatementsGetter>,
    Partial<ConstructorHeadStatementsGetter>,
    Partial<ConstructorBodyStatementsGetter>,
    Partial<ConstructorTailStatementsGetter> {
  /** A human-readable string for debugging. */
  keyword: readonly string;

  /**
   * Bitwise flags to determine which statement getter traps are active.
   * @see ClassSupportsStatementsFlags
   */
  supportsStatementsFlags: readonly number;
}
