import assert from "node:assert/strict";

import {
  StructureKind
} from "ts-morph";

import {
  ClassFieldStatementsMap,
  type ClassAbstractMemberQuestion,
  type ClassAsyncMethodQuestion,
  type ClassGeneratorMethodQuestion,
  type ClassMemberImpl,
  type ClassScopeMemberQuestion,
  type ClassStatementsGetter,
  ClassMembersMap,
  ConstructorDeclarationImpl,
  type GetAccessorDeclarationImpl,
  IndexSignatureResolver,
  type InterfaceDeclarationImpl,
  type MethodDeclarationImpl,
  type MethodSignatureImpl,
  MemberedStatementsKey,
  type MemberedObjectTypeStructureImpl,
  NamedTypeMemberImpl,
  ParameterDeclarationImpl,
  type PropertyDeclarationImpl,
  type PropertySignatureImpl,
  type SetAccessorDeclarationImpl,
  type TypeMemberImpl,
  TypeMembersMap,
  type stringWriterOrStatementImpl,
} from "../../snapshot/source/exports.js";

import {
  MemberedStatementsKeyClass,
} from "../../snapshot/source/internal-exports.js";

/** @internal */
interface ClassMembersByKind {
  readonly ctors: ConstructorDeclarationImpl[];
  readonly getAccessors: GetAccessorDeclarationImpl[];
  readonly methods: MethodDeclarationImpl[];
  readonly properties: PropertyDeclarationImpl[];
  readonly setAccessors: SetAccessorDeclarationImpl[];
}

interface InsertedMemberKey {
  readonly isFieldStatic: boolean;
  readonly fieldType: PropertySignatureImpl;
  readonly isGroupStatic: boolean;
  readonly groupType: (
    GetAccessorDeclarationImpl |
    SetAccessorDeclarationImpl |
    MethodSignatureImpl |
    "constructor" |
    "(initializer or property reference)" /* ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY */
  )
}

/**
 * Bitwise flags to enable statement getter traps.
 */
export enum ClassSupportsStatementsFlags {
  /** The initial value of a property.*/
  PropertyInitializer = 1 << 0,
  /** Values for a class getter or class setter to mirror. */
  AccessorMirror = 1 << 1,
  /** Statements starting a statement purpose block. */
  HeadStatements = 1 << 2,
  /** Statements in a purpose block for a given property and class member. */
  BodyStatements = 1 << 3,
  /** Statements closing a statement purpose block. */
  TailStatements = 1 << 4,
  /** Statements starting a statement purpose block for the constructor. */
  ConstructorHeadStatements = 1 << 5,
  /** Statements in a purpose block for a given property on the constructor. */
  ConstructorBodyStatements = 1 << 6,
  /** Statements closing a statement purpose block for the constructor. */
  ConstructorTailStatements = 1 << 7,
}

/** Convert type members to a class members map, including statements. */
export default class MemberedTypeToClass {
  static #compareKeys(
    this: void,
    a: MemberedStatementsKey,
    b: MemberedStatementsKey
  ): number
  {
    if (a.isGroupStatic && !b.isGroupStatic)
      return -1;
    if (b.isGroupStatic && !a.isGroupStatic)
      return +1;

    let result = a.statementGroupKey.localeCompare(b.statementGroupKey);
    if (result)
      return result;

    if (a.isFieldStatic && !b.isFieldStatic)
      return -1;
    if (b.isFieldStatic && !a.isFieldStatic)
      return +1;

    result = ClassFieldStatementsMap.fieldComparator(a.fieldKey, b.fieldKey);
    return result;
  }

  static #supportsFlagsNumbers: readonly number[];
  static {
    this.#supportsFlagsNumbers = Array.from(
      Object.values(ClassSupportsStatementsFlags)
    ).filter(n => typeof n === "number") as number[];
  }

  static #getFlagForFieldAndGroup(
    formattedFieldName: string,
    formattedGroupName: string
  ): ClassSupportsStatementsFlags
  {
    let flag: ClassSupportsStatementsFlags;
    switch (formattedFieldName) {
      case ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL:
        if (formattedGroupName === "constructor")
          flag = ClassSupportsStatementsFlags.ConstructorHeadStatements;
        else
          flag = ClassSupportsStatementsFlags.HeadStatements;
        break;

      case ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN:
        if (formattedGroupName === "constructor")
          flag = ClassSupportsStatementsFlags.ConstructorTailStatements;
        else
          flag = ClassSupportsStatementsFlags.TailStatements;
        break;

      default:
        if (formattedGroupName === "constructor")
          flag = ClassSupportsStatementsFlags.ConstructorBodyStatements;
        else
          flag = ClassSupportsStatementsFlags.BodyStatements;
    }
    return flag;
  }

  static #validateStatementsGetter(
    getter: ClassStatementsGetter
  ): readonly Error[]
  {
    const errors: Error[] = [];
    let validFlagFound = false;
    if (this.#validateStatementsGetterByFlag(
      getter,
      ClassSupportsStatementsFlags.PropertyInitializer,
      "filterPropertyInitializer",
      "getPropertyInitializer",
      errors
    ))
      validFlagFound = true;

    if (this.#validateStatementsGetterByFlag(
      getter,
      ClassSupportsStatementsFlags.AccessorMirror,
      "filterAccessorMirror",
      "getAccessorMirror",
      errors
    ))
      validFlagFound = true;

    if (this.#validateStatementsGetterByFlag(
      getter,
      ClassSupportsStatementsFlags.HeadStatements,
      "filterHeadStatements",
      "getHeadStatements",
      errors
    ))
      validFlagFound = true;

    if (this.#validateStatementsGetterByFlag(
      getter,
      ClassSupportsStatementsFlags.BodyStatements,
      "filterBodyStatements",
      "getBodyStatements",
      errors
    ))
      validFlagFound = true;

    if (this.#validateStatementsGetterByFlag(
      getter,
      ClassSupportsStatementsFlags.TailStatements,
      "filterTailStatements",
      "getTailStatements",
      errors
    ))
      validFlagFound = true;

    if (this.#validateStatementsGetterByFlag(
      getter,
      ClassSupportsStatementsFlags.ConstructorHeadStatements,
      "filterCtorHeadStatements",
      "getCtorHeadStatements",
      errors
    ))
      validFlagFound = true;

    if (this.#validateStatementsGetterByFlag(
      getter,
      ClassSupportsStatementsFlags.ConstructorBodyStatements,
      "filterCtorBodyStatements",
      "getCtorBodyStatements",
      errors
    ))
      validFlagFound = true;

    if (this.#validateStatementsGetterByFlag(
      getter,
      ClassSupportsStatementsFlags.ConstructorTailStatements,
      "filterCtorTailStatements",
      "getCtorTailStatements",
      errors
    ))
      validFlagFound = true;

    if (!validFlagFound) {
      errors.push(new Error("statements getter's supportsStatementsFlag property is invalid: " + getter.keyword));
    }

    return errors;
  }

  static #validateStatementsGetterByFlag(
    getter: ClassStatementsGetter,
    flag: ClassSupportsStatementsFlags,
    filterName: Extract<keyof ClassStatementsGetter, `filter${string}`>,
    getterName: Extract<keyof ClassStatementsGetter, `get${string}`>,
    errors: Error[]
  ): boolean
  {
    if (getter.supportsStatementsFlags & flag) {
      if (!getter[filterName]) {
        errors.push(new Error(`statements getter is missing ${filterName}: ${getter.keyword}`));
      }
      if (!getter[getterName]) {
        errors.push(new Error(`statements getter is missing ${getterName}: ${getter.keyword}`));
      }
      return true;
    }
    return false;
  }

  readonly #aggregateStaticTypesMap = new TypeMembersMap;
  readonly #aggregateTypeMembersMap = new TypeMembersMap;
  readonly #classMemberToTypeMemberMap = new WeakMap<ClassMemberImpl, TypeMemberImpl>;
  readonly #memberKeyToClassMember = new Map<string, ClassMemberImpl>;

  #classMembersMap?: ClassMembersMap;
  readonly #classFieldStatementsByPurpose = new Map<string, ClassFieldStatementsMap>;

  readonly #classConstructor = new ConstructorDeclarationImpl;

  #indexSignatureResolver?: IndexSignatureResolver;
  #isAbstractCallback?: ClassAbstractMemberQuestion;
  #isAsyncCallback?: ClassAsyncMethodQuestion;
  #isGeneratorCallback?: ClassGeneratorMethodQuestion;
  #scopeCallback?: ClassScopeMemberQuestion;
  readonly #insertedMemberKeys: InsertedMemberKey[] = [];

  readonly #statementsGettersBySupportFlag = new Map<
    ClassSupportsStatementsFlags, ClassStatementsGetter[]
  >;
  readonly #statementsGettersToPriorityAndPositionMap = new Map<
    ClassStatementsGetter, [number, number]
  >;
  readonly #statementKeysBySupportFlag = new Map<
    ClassSupportsStatementsFlags, MemberedStatementsKey[]
  >;

  #requireNotStarted(): void {
    if (this.#classMembersMap)
      throw new Error("You have already called buildClassDeclaration()");
  }

  /** The class constructor's current parameters list. */
  get constructorParameters(): ParameterDeclarationImpl[] {
    return this.#classConstructor.parameters;
  }

  /**
   * An interface to get names which match an index signature's key name.
   */
  get indexSignatureResolver(): IndexSignatureResolver | undefined {
    return this.#indexSignatureResolver;
  }

  set indexSignatureResolver(value: IndexSignatureResolver | undefined) {
    this.#requireNotStarted();
    this.#indexSignatureResolver = value;
  }

  get isAbstractCallback(): ClassAbstractMemberQuestion | undefined
  {
    return this.#isAbstractCallback;
  }

  set isAbstractCallback(
    value: ClassAbstractMemberQuestion | undefined
  )
  {
    this.#requireNotStarted();
    this.#isAbstractCallback = value;
  }

  get isAsyncCallback(): ClassAsyncMethodQuestion | undefined {
    return this.#isAsyncCallback;
  }

  set isAsyncCallback(value: ClassAsyncMethodQuestion | undefined) {
    this.#requireNotStarted();
    this.#isAsyncCallback = value;
  }

  get isGeneratorCallback(): ClassGeneratorMethodQuestion | undefined {
    return this.#isGeneratorCallback;
  }

  set isGeneratorCallback(value: ClassGeneratorMethodQuestion | undefined) {
    this.#requireNotStarted();
    this.#isGeneratorCallback = value;
  }

  get scopeCallback(): ClassScopeMemberQuestion | undefined {
    return this.#scopeCallback;
  }

  set scopeCallback(
    value: ClassScopeMemberQuestion | undefined
  )
  {
    this.#requireNotStarted();
    this.#scopeCallback = value;
  }

  //#region type members

  /**
   * Get the current type members in our cache.
   *
   * @internal This is for debugging and testing purposes only.
   */
  getCurrentTypeMembers(
    isStatic: boolean
  ): readonly TypeMemberImpl[]
  {
    return Array.from(isStatic ?
      this.#aggregateStaticTypesMap.values() :
      this.#aggregateTypeMembersMap.values()
    );
  }

  /**
   * Define a class member for a given type member (constructor, property, method, getter, setter).
   * @param isStatic - true if the class member is static.
   * @param member - the type member to convert to a class member.
   */
  addTypeMember(
    isStatic: boolean,
    member: TypeMemberImpl,
  ): void
  {
    this.#requireNotStarted();
    const typeMembersMap = new TypeMembersMap([
      [(TypeMembersMap.keyFromMember(member)), member]
    ]);
    const temporaryTypeMembers = new TypeMembersMap;
    this.#importFromTypeMembers(isStatic, typeMembersMap, temporaryTypeMembers);

    this.#adoptTypeMembers(isStatic, temporaryTypeMembers);
  }

  /**
   * Define class members for a map of given type members (constructor, property, method, getter, setter).
   * @param isStatic - true if the class members are static.
   * @param membersMap - the type members map for conversion to class members.
   */
  importFromTypeMembersMap(
    isStatic: boolean,
    membersMap: TypeMembersMap,
  ): void
  {
    this.#requireNotStarted();
    const temporaryTypeMembers = new TypeMembersMap;
    this.#importFromTypeMembers(isStatic, membersMap, temporaryTypeMembers);

    this.#adoptTypeMembers(isStatic, temporaryTypeMembers);
  }

  /**
   * Define class members for a membered object type or interface.
   * @param isStatic - true if the class members are static.
   * @param membered - the interface or membered object type.
   */
  importFromMemberedType(
    isStatic: boolean,
    membered: InterfaceDeclarationImpl | MemberedObjectTypeStructureImpl
  ): void
  {
    return this.importFromTypeMembersMap(
      isStatic, TypeMembersMap.fromMemberedObject(membered)
    );
  }

  #importFromTypeMembers(
    isStatic: boolean,
    membersMap: TypeMembersMap,
    temporaryTypeMembers: TypeMembersMap
  ): void
  {
    for (const member of membersMap.values()) {
      this.#validateTypeMember(isStatic, member, temporaryTypeMembers);
    }
  }

  #validateTypeMember(
    isStatic: boolean,
    member: TypeMemberImpl,
    temporaryTypeMembers: TypeMembersMap
  ): void
  {
    switch (member.kind) {
      case StructureKind.CallSignature:
        throw new Error("Call signatures are not allowed");
      case StructureKind.ConstructSignature:
        throw new Error("Construct signatures are not allowed");
      case StructureKind.IndexSignature: {
        if (isStatic) {
          //TODO: rethink this.  Maybe this is doable via a `satisfies` statement.
          throw new Error("index signatures cannot be static");
        }
        if (!this.#indexSignatureResolver) {
          throw new Error("Index signature found, but no index signature resolver is available");
        }
        const names: string[] = this.#indexSignatureResolver.resolveIndexSignature(member);
        names.forEach(name => {
          if (this.#aggregateTypeMembersMap.has(name) || temporaryTypeMembers.has(name)) {
            throw new Error(`Index signature resolver requested the name "${name}", but this field already exists.`);
          }
        });

        temporaryTypeMembers.addMembers([member]);
        const newMembers: NamedTypeMemberImpl[] = temporaryTypeMembers.resolveIndexSignature(member, names);
        newMembers.forEach(newMember => temporaryTypeMembers.delete(TypeMembersMap.keyFromMember(newMember)));
        newMembers.forEach(newMember => this.#validateTypeMember(isStatic, newMember, temporaryTypeMembers));
        return;
      }

      default: {
        const key = TypeMembersMap.keyFromMember(member);
        const aggregateMembers: TypeMembersMap = isStatic ? this.#aggregateStaticTypesMap : this.#aggregateTypeMembersMap;
        if (aggregateMembers.has(key)) {
          throw new Error(`You already have a class member with the key "${key}".`);
        }
        if (temporaryTypeMembers.has(key)) {
          throw new Error(`You already have a class member with the key "${key}", possibly through an index signature resolution.`);
        }
        temporaryTypeMembers.addMembers([member]);
      }
    }
  }

  #adoptTypeMembers(
    isStatic: boolean,
    temporaryTypeMembers: TypeMembersMap
  ): void
  {
    const map: TypeMembersMap = isStatic ? this.#aggregateStaticTypesMap : this.#aggregateTypeMembersMap;
    map.addMembers(Array.from(temporaryTypeMembers.values()));
  }

  //#endregion type members

  //#region build the class members map

  /**
   * Convert cached type members to a ClassMembersMap, complete with statements.
   */
  buildClassMembersMap(): ClassMembersMap
  {
    this.#requireNotStarted();
    this.#classMembersMap = new ClassMembersMap;

    const members = this.#addClassMembersToMap();
    this.#sortStatementGetters();
    this.#buildKeyClasses(members);

    const errors: Error[] = this.#buildStatements();
    if (errors.length)
      throw new AggregateError(errors);

    this.#classMembersMap.moveStatementsToMembers(Array.from(this.#classFieldStatementsByPurpose.values()));

    if (this.#classConstructor.statements.length === 0) {
      this.#classMembersMap.delete(
        ClassMembersMap.keyFromMember(this.#classConstructor)
      );
    }

    return this.#classMembersMap;
  }

  #addClassMembersToMap(): ClassMemberImpl[]
  {
    const staticTypeMembers = Array.from(this.#aggregateStaticTypesMap.values()) as NamedTypeMemberImpl[];
    const typeMembers = Array.from(this.#aggregateTypeMembersMap.values()) as NamedTypeMemberImpl[];
    const staticMembers = ClassMembersMap.convertTypeMembers(
      true, staticTypeMembers, this.#classMemberToTypeMemberMap
    );
    const classMembers = ClassMembersMap.convertTypeMembers(
      false, typeMembers, this.#classMemberToTypeMemberMap
    );

    const members: ClassMemberImpl[] = [
      ...staticMembers,
      this.#classConstructor,
      ...classMembers
    ];

    this.#classMembersMap!.addMembers(members);

    if (this.#isAbstractCallback) {
      classMembers.forEach(member => {
        member.isAbstract = this.#isAbstractCallback!.isAbstract(member.kind, member.name);
      });
    }

    if (this.#scopeCallback) {
      members.forEach(member => {
        const [isStatic, name] =
          (member.kind === StructureKind.Constructor) ?
          [false, "constructor"] :
          [member.isStatic, member.name];

        member.scope = this.#scopeCallback!.getScope(isStatic, member.kind, name);
      });
    }

    if (this.#isAsyncCallback ?? this.#isGeneratorCallback) {
      const methods = members.filter(
        member => member.kind === StructureKind.Method
      );

      methods.forEach(method => {
        if (this.#isAsyncCallback) {
          method.isAsync = this.#isAsyncCallback.isAsync(
            method.isStatic, method.name
          );
        }
        if (this.#isGeneratorCallback) {
          method.isGenerator = this.#isGeneratorCallback.isGenerator(
            method.isStatic, method.name
          );
        }
      });
    }

    return members;
  }

  //#endregion build the class members map

  //#region statement management

  /**
   * Define a statement purpose group for the target class.
   *
   * @param purposeKey - The purpose of the statmeent group (validation, preconditions, body, postconditions, etc.)
   * @param isBlockStatement - true if the statement block should be enclosed in curly braces.
   * @param regionName - an optional #region / #endregion comment name.
   *
   * Call this in the order of statement purpose groups you intend.
   */
  defineStatementsByPurpose(
    purposeKey: string,
    isBlockStatement: boolean,
    regionName?: string
  ): void
  {
    this.#requireNotStarted();
    if (this.#classFieldStatementsByPurpose.has(purposeKey))
      throw new Error("You have already defined a statements purpose with the key: " + purposeKey);
    const statementsMap = new ClassFieldStatementsMap;
    this.#classFieldStatementsByPurpose.set(purposeKey, statementsMap);
    statementsMap.purposeKey = purposeKey;
    statementsMap.isBlockStatement = isBlockStatement;
    if (regionName) {
      statementsMap.regionName = regionName;
    }
  }

  /**
   * Add statement getters to this.
   *
   * @param priority - a number indicating the priority of the getters (lower numbers beat higher numbers).
   * @param statementGetters - the statement getters to insert.
   */
  addStatementGetters(
    priority: number,
    statementGetters: readonly ClassStatementsGetter[]
  ): void
  {
    const knownGetters: string[] = [];
    const invalidGetterErrors: Error[] = [];

    for (const getter of statementGetters) {
      if (this.#statementsGettersToPriorityAndPositionMap.has(getter))
        knownGetters.push(getter.keyword);
      else
        invalidGetterErrors.push(...MemberedTypeToClass.#validateStatementsGetter(getter));
    }

    if (knownGetters.length > 0) {
      invalidGetterErrors.unshift(new Error(
        "The following getters are already known: " + knownGetters.join(", ")
      ));
    }

    if (invalidGetterErrors.length > 0) {
      throw new AggregateError(invalidGetterErrors);
    }

    for (const getter of statementGetters) {
      this.#statementsGettersToPriorityAndPositionMap.set(
        getter, [priority, this.#statementsGettersToPriorityAndPositionMap.size]
      );
      for (const flag of MemberedTypeToClass.#supportsFlagsNumbers) {
        if (flag & getter.supportsStatementsFlags) {
          let getterArray = this.#statementsGettersBySupportFlag.get(flag);
          if (!getterArray) {
            getterArray = [];
            this.#statementsGettersBySupportFlag.set(flag, getterArray);
          }
          getterArray.push(getter);
        }
      }
    }
  }

  #sortStatementGetters(): void {
    const comparator = this.#compareStatementGetters.bind(this);
    for (const getterArray of this.#statementsGettersBySupportFlag.values()) {
      getterArray.sort(comparator);
    }
  }

  #compareStatementGetters(
    a: ClassStatementsGetter,
    b: ClassStatementsGetter
  ): number
  {
    const [aPriority, aPosition] = this.#statementsGettersToPriorityAndPositionMap.get(a)!;
    const [bPriority, bPosition] = this.#statementsGettersToPriorityAndPositionMap.get(b)!;
    return (aPriority - bPriority) || (aPosition - bPosition);
  }

  //#endregion statement management

  //#region statement key management

  #buildKeyClasses(
    members: ClassMemberImpl[]
  ): MemberedStatementsKeyClass[]
  {
    const keyClassMap = new Map<string, MemberedStatementsKeyClass>;
    const purposeKeys: string[] = Array.from(this.#classFieldStatementsByPurpose.keys());

    const membersByKind = this.#sortMembersByKind(members);

    membersByKind.properties.forEach(
      property => this.#addPropertyInitializerKeys(keyClassMap, purposeKeys, property)
    );

    let propertyNames: string[] = [
      ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL,
      ...membersByKind.properties.map(property => ClassMembersMap.keyFromMember(property)),
      ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN
    ];
    propertyNames = Array.from(new Set(propertyNames));

    this.#addStatementKeysForMethodOrCtor(this.#classConstructor, keyClassMap, purposeKeys, propertyNames);
    membersByKind.methods.forEach(
      method => this.#addStatementKeysForMethodOrCtor(method, keyClassMap, purposeKeys, propertyNames)
    );

    membersByKind.getAccessors.forEach(getter => {
      this.#addAccessorInitializerKey(getter, keyClassMap, purposeKeys);
      this.#addStatementKeysForAccessor(getter, keyClassMap, purposeKeys, propertyNames);
    });

    membersByKind.setAccessors.forEach(setter => {
      this.#addAccessorInitializerKey(setter, keyClassMap, purposeKeys);
      this.#addStatementKeysForAccessor(setter, keyClassMap, purposeKeys, propertyNames);
    });

    this.#insertedMemberKeys.forEach(addedKey => this.#applyInsertedKeys(addedKey, keyClassMap, purposeKeys));

    const result = Array.from(keyClassMap.values());
    result.sort(MemberedTypeToClass.#compareKeys);
    return result;
  }

  /**
   * Add member keys for a field and a group.
   * @param isFieldStatic - true if the field is static.
   * @param fieldType - the field signature.
   * @param isGroupStatic - true if the group is static (false for constructors)
   * @param groupType - the group signature, or "constructor" for the constructor I generate.
   */
  insertMemberKey(
    isFieldStatic: boolean,
    fieldType: PropertySignatureImpl,
    isGroupStatic: boolean,
    groupType: InsertedMemberKey["groupType"]
  ): void
  {
    this.#insertedMemberKeys.push({
      isFieldStatic, fieldType, isGroupStatic, groupType
    })
  }

  #sortMembersByKind(members: ClassMemberImpl[]): ClassMembersByKind {
    const membersByKind: ClassMembersByKind = {
      ctors: [],
      getAccessors: [],
      methods: [],
      properties: [],
      setAccessors: []
    };

    members.forEach(member => {
      switch (member.kind) {
        case StructureKind.Constructor:
          membersByKind.ctors.push(member);
          return;
        case StructureKind.GetAccessor:
          membersByKind.getAccessors.push(member);
          return;
        case StructureKind.Method:
          membersByKind.methods.push(member);
          return;
        case StructureKind.Property:
          membersByKind.properties.push(member);
          return;
        case StructureKind.SetAccessor:
          membersByKind.setAccessors.push(member);
          return;
        default:
          assert(false, "not reachable");
      }
    });

    return membersByKind;
  }

  #addPropertyInitializerKeys(
    keyClassMap: Map<string, MemberedStatementsKeyClass>,
    purposeKeys: string[],
    property: PropertyDeclarationImpl,
  ): void
  {
    if (property.isAbstract)
      return;

    const [
      formattedFieldName, formattedGroupName
    ] = ClassFieldStatementsMap.normalizeKeys(
      ClassMembersMap.keyFromMember(property),
      ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY
    );

    if (!this.#memberKeyToClassMember.has(formattedFieldName))
      this.#memberKeyToClassMember.set(formattedFieldName, property);

    for (const purposeKey of purposeKeys) {
      this.#addKeyClass(
        ClassSupportsStatementsFlags.PropertyInitializer,
        formattedFieldName,
        formattedGroupName,
        purposeKey,
        keyClassMap
      );
    }
  }

  #addStatementKeysForMethodOrCtor(
    methodOrCtor: MethodDeclarationImpl | ConstructorDeclarationImpl,
    keyClassMap: Map<string, MemberedStatementsKeyClass>,
    purposeKeys: string[],
    propertyNames: string[],
  ): void
  {
    if (methodOrCtor.kind === StructureKind.Method && methodOrCtor.isAbstract)
      return;

    const groupName = ClassMembersMap.keyFromMember(methodOrCtor);
    if (!this.#memberKeyToClassMember.has(groupName))
      this.#memberKeyToClassMember.set(groupName, methodOrCtor);

    for (const fieldName of propertyNames) {
      const [
        formattedFieldName, formattedGroupName
      ] = ClassFieldStatementsMap.normalizeKeys(fieldName, groupName);

      const flag: ClassSupportsStatementsFlags = MemberedTypeToClass.#getFlagForFieldAndGroup(
        formattedFieldName, formattedGroupName
      );

      for (const purposeKey of purposeKeys) {
        this.#addKeyClass(
          flag,
          formattedFieldName,
          formattedGroupName,
          purposeKey,
          keyClassMap
        );
      }
    }
  }

  #addAccessorInitializerKey(
    accessor: GetAccessorDeclarationImpl | SetAccessorDeclarationImpl,
    keyClassMap: Map<string, MemberedStatementsKeyClass>,
    purposeKeys: string[],
  ): void {
    if (accessor.isAbstract)
      return;

    const accessorName = ClassMembersMap.keyFromMember(accessor).replace(/\b[gs]et /, "");
    if (!this.#memberKeyToClassMember.has(accessorName))
      this.#memberKeyToClassMember.set(accessorName, accessor);

    purposeKeys.forEach(purposeKey => this.#addKeyClass(
      ClassSupportsStatementsFlags.AccessorMirror,
      accessorName,
      ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY,
      purposeKey,
      keyClassMap
    ));
  }

  #addStatementKeysForAccessor(
    accessor: GetAccessorDeclarationImpl | SetAccessorDeclarationImpl,
    keyClassMap: Map<string, MemberedStatementsKeyClass>,
    purposeKeys: string[],
    propertyNames: string[],
  ): void
  {
    if (accessor.isAbstract)
      return;

    const accessorName = ClassMembersMap.keyFromMember(accessor);

    if (!this.#memberKeyToClassMember.has(accessorName))
      this.#memberKeyToClassMember.set(accessorName, accessor);

    for (const propertyName of propertyNames) {
      const flag: ClassSupportsStatementsFlags = MemberedTypeToClass.#getFlagForFieldAndGroup(propertyName, accessorName);
      for (const purposeKey of purposeKeys) {
        this.#addKeyClass(
          flag,
          propertyName,
          accessorName,
          purposeKey,
          keyClassMap
        );
      }
    }
  }

  #applyInsertedKeys(
    addedKey: InsertedMemberKey,
    keyClassMap: Map<string, MemberedStatementsKeyClass>,
    purposeKeys: readonly string[]
  ): void
  {
    let fieldName = TypeMembersMap.keyFromName(addedKey.fieldType.kind, addedKey.fieldType.name);
    if (addedKey.isFieldStatic)
      fieldName = "static " + fieldName;

    let groupName = "constructor";
    if ((addedKey.groupType !== "constructor") && (addedKey.groupType !== ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY)) {
      groupName = TypeMembersMap.keyFromName(addedKey.groupType.kind, addedKey.groupType.name);
      if (addedKey.isGroupStatic) {
        groupName = "static " + groupName;
      }
    }

    const [
      formattedFieldName, formattedGroupName
    ] = ClassFieldStatementsMap.normalizeKeys(fieldName, groupName);
    const flag: ClassSupportsStatementsFlags = MemberedTypeToClass.#getFlagForFieldAndGroup(
      formattedFieldName, formattedGroupName
    );

    for (const purposeKey of purposeKeys) {
      this.#addKeyClass(
        flag, formattedFieldName, formattedGroupName, purposeKey, keyClassMap
      );
    }
  }

  #addKeyClass(
    supportsStatementsFlag: ClassSupportsStatementsFlags,
    fieldName: string,
    groupName: string,
    purposeKey: string,
    keyClassMap: Map<string, MemberedStatementsKeyClass>,
  ): void
  {
    const compositeKey = JSON.stringify({fieldName, groupName, purposeKey});
    if (keyClassMap.has(compositeKey))
      return;

    const fieldClassMember = this.#memberKeyToClassMember.get(fieldName);
    const groupClassMember = this.#memberKeyToClassMember.get(groupName);

    const fieldTypeMember = fieldClassMember ? this.#classMemberToTypeMemberMap.get(fieldClassMember) : undefined;
    const groupTypeMember = groupClassMember ? this.#classMemberToTypeMemberMap.get(groupClassMember) : undefined;
    const isFieldStatic = fieldClassMember && fieldClassMember.kind !== StructureKind.Constructor ?
      fieldClassMember.isStatic : false;
    const isGroupStatic = groupClassMember && groupClassMember.kind !== StructureKind.Constructor ?
      groupClassMember.isStatic : false;

    const key = new MemberedStatementsKeyClass(
      fieldName,
      groupName,
      purposeKey,
      fieldTypeMember ? [isFieldStatic, fieldTypeMember] : undefined,
      groupTypeMember ? [isGroupStatic, groupTypeMember] : undefined,
    );
    keyClassMap.set(compositeKey, key);

    let keyArray = this.#statementKeysBySupportFlag.get(supportsStatementsFlag);
    if (!keyArray) {
      keyArray = [];
      this.#statementKeysBySupportFlag.set(supportsStatementsFlag, keyArray);
    }
    keyArray.push(key);
  }
  //#endregion statement key management


  //#region get the statements!
  #buildStatements(): Error[]
  {
    return [
      ...this.#buildPropertyInitializerStatements(),
      ...this.#buildAccessorMirrorStatements(),
      ...this.#buildHeadStatements(),
      ...this.#buildBodyStatements(),
      ...this.#buildTailStatements(),
      ...this.#buildCtorHeadStatements(),
      ...this.#buildCtorBodyStatements(),
      ...this.#buildCtorTailStatements(),
    ];
  }

  #buildPropertyInitializerStatements(): Error[]
  {
    const getters = this.#statementsGettersBySupportFlag.get(ClassSupportsStatementsFlags.PropertyInitializer) ?? [];
    if (getters.length === 0) {
      return [];
    }

    const keys = this.#statementKeysBySupportFlag.get(ClassSupportsStatementsFlags.PropertyInitializer) ?? [];

    const errors: Error[] = [];
    keys.forEach(key => {
      for (const getter of getters) {
        try {
          if (getter.filterPropertyInitializer!(key) === false)
            continue;
          const statement = getter.getPropertyInitializer!(key);
          if (statement)
            this.#addStatementsToMap(key, [statement]);
          break;
        }
        catch (ex) {
          errors.push(ex as Error);
        }
      }
    });

    return errors;
  }

  #buildAccessorMirrorStatements(): Error[]
  {
    const getters = this.#statementsGettersBySupportFlag.get(ClassSupportsStatementsFlags.AccessorMirror) ?? [];
    if (getters.length === 0) {
      return [];
    }

    const keys = this.#statementKeysBySupportFlag.get(ClassSupportsStatementsFlags.AccessorMirror) ?? [];

    const errors: Error[] = [];
    keys.forEach(key => {
      for (const getter of getters) {
        try {
          if (getter.filterAccessorMirror!(key) === false)
            continue;
          const statement = getter.getAccessorMirror!(key);
          if (statement)
            this.#addStatementsToMap(key, [statement]);
          break;
        }
        catch (ex) {
          errors.push(ex as Error);
        }
      }
    });

    return errors;
  }

  #buildHeadStatements(): Error[]
  {
    return this.#buildStatementsForFlag(
      ClassSupportsStatementsFlags.HeadStatements,
      "filterHeadStatements",
      "getHeadStatements",
    );
  }

  #buildBodyStatements(): Error[]
  {
    return this.#buildStatementsForFlag(
      ClassSupportsStatementsFlags.BodyStatements,
      "filterBodyStatements",
      "getBodyStatements"
    );
  }

  #buildTailStatements(): Error[]
  {
    return this.#buildStatementsForFlag(
      ClassSupportsStatementsFlags.TailStatements,
      "filterTailStatements",
      "getTailStatements"
    );
  }

  #buildCtorHeadStatements(): Error[]
  {
    return this.#buildStatementsForFlag(
      ClassSupportsStatementsFlags.ConstructorHeadStatements,
      "filterCtorHeadStatements",
      "getCtorHeadStatements",
    );
  }

  #buildCtorBodyStatements(): Error[]
  {
    return this.#buildStatementsForFlag(
      ClassSupportsStatementsFlags.ConstructorBodyStatements,
      "filterCtorBodyStatements",
      "getCtorBodyStatements"
    );
  }

  #buildCtorTailStatements(): Error[]
  {
    return this.#buildStatementsForFlag(
      ClassSupportsStatementsFlags.ConstructorTailStatements,
      "filterCtorTailStatements",
      "getCtorTailStatements",
    );
  }

  #buildStatementsForFlag(
    flag: ClassSupportsStatementsFlags,
    filterName: Extract<keyof ClassStatementsGetter, `filter${string}Statements`>,
    getterName: Extract<keyof ClassStatementsGetter, `get${string}Statements`>,
  ): Error[]
  {
    const getters = this.#statementsGettersBySupportFlag.get(flag) ?? [];
    if (getters.length === 0) {
      return [];
    }

    const keys = this.#statementKeysBySupportFlag.get(flag) ?? [];
    const errors: Error[] = [];
    for (const key of keys) {
      for (const getter of getters) {
        try {
          if (getter[filterName]!(key) === false)
            continue;
          const statements = getter[getterName]!(key);
          if (statements.length > 0)
            this.#addStatementsToMap(key, statements);
          break;
        }
        catch (ex) {
          errors.push(ex as Error);
        }
      }
    }

    return errors;
  }

  #addStatementsToMap(
    keyClass: MemberedStatementsKey,
    statementsArray: readonly stringWriterOrStatementImpl[]
  ): void
  {
    const statementsMap: ClassFieldStatementsMap =
      this.#classFieldStatementsByPurpose.get(keyClass.purpose)!;
    statementsMap.set(keyClass.fieldKey, keyClass.statementGroupKey, statementsArray.slice());
  }
  //#endregion get the statements!
}
