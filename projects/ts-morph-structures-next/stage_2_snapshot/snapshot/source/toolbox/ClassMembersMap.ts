import { KindedStructure, StructureKind } from "ts-morph";

import {
  ClassDeclarationImpl,
  ClassFieldStatementsMap,
  type ClassMemberImpl,
  type NamedClassMemberImpl,
  ConstructorDeclarationImpl,
  GetAccessorDeclarationImpl,
  JSDocImpl,
  MethodDeclarationImpl,
  ParameterDeclarationImpl,
  PropertyDeclarationImpl,
  SetAccessorDeclarationImpl,
  type NamedTypeMemberImpl,
  type TypeMemberImpl,
} from "../exports.js";

import {
  StructureClassesMap,
  TypeStructureClassesMap,
} from "../internal-exports.js";

import OrderedMap from "./OrderedMap.js";

/**
 * A map for class methods, properties, accessors and a constructor.  This doesn't
 * replace `ClassDeclarationImpl`, rather, it _feeds_ `ClassDeclarationImpl`.
 *
 * @example
 *
 * const map = new ClassMembersMap;
 * const foo = new PropertyDeclarationImpl(false, "foo");
 * map.addMembers([foo]);
 * // ...
 * const classDecl = new ClassDeclarationImpl;
 * classDecl.name = "FooClass";
 * map.moveMembersToClass(classDecl);
 * // classDecl.properties === [foo];
 */
export default class ClassMembersMap extends OrderedMap<
  string,
  ClassMemberImpl
> {
  /**
   * Get a map key from a potential class member.
   * @param member - the class member
   */
  static keyFromMember(member: ClassMemberImpl): string {
    if (member.kind === StructureKind.Constructor) return "constructor";

    return this.keyFromName(member.kind, member.isStatic, member.name);
  }

  /**
   * @param kind - the structure kind.
   * @param isStatic - true if the class member should be static.
   * @param name - the name of the class member.
   * @returns the map key to use.
   */
  static keyFromName(
    kind: ClassMemberImpl["kind"],
    isStatic: boolean,
    name: string,
  ): string {
    if (kind === StructureKind.Constructor) return "constructor";

    let rv = "";
    if (isStatic) rv = "static ";
    if (kind === StructureKind.GetAccessor) rv += "get ";
    else if (kind === StructureKind.SetAccessor) rv += "set ";
    rv += name;
    return rv;
  }

  /**
   * Create a `ClassMembersMap` from a class declaration.
   * @param classDecl - the class declaration.
   * @returns the class members map.
   */
  static fromClassDeclaration(
    classDecl: ClassDeclarationImpl,
  ): ClassMembersMap {
    const map = new ClassMembersMap();

    const members: ClassMemberImpl[] = [
      ...classDecl.ctors,
      ...classDecl.getAccessors,
      ...classDecl.methods,
      ...classDecl.properties,
      ...classDecl.setAccessors,
    ];
    map.addMembers(members);

    return map;
  }

  /**
   * Creata an array of class members from an array of type members,
   * @param isStatic - true if the class members should be static, false if they should not be.
   * @param typeMembers - the type members to convert.
   * @param map - for defining which type member a class member comes from.
   */
  static convertTypeMembers(
    isStatic: boolean,
    typeMembers: NamedTypeMemberImpl[],
    map?: WeakMap<ClassMemberImpl, TypeMemberImpl>,
  ): NamedClassMemberImpl[] {
    return typeMembers.map((typeMember) =>
      ClassMembersMap.#convertTypeMemberToClassMember(
        isStatic,
        typeMember,
        map,
      ),
    );
  }

  static #convertTypeMemberToClassMember(
    isStatic: boolean,
    typeMember: NamedTypeMemberImpl,
    map?: WeakMap<ClassMemberImpl, TypeMemberImpl>,
  ): NamedClassMemberImpl {
    let classMember: NamedClassMemberImpl;
    switch (typeMember.kind) {
      case StructureKind.GetAccessor: {
        classMember = GetAccessorDeclarationImpl.clone(typeMember);
        classMember.isStatic = isStatic;
        break;
      }
      case StructureKind.SetAccessor: {
        classMember = SetAccessorDeclarationImpl.clone(typeMember);
        classMember.isStatic = isStatic;
        break;
      }
      case StructureKind.MethodSignature:
        classMember = MethodDeclarationImpl.fromSignature(isStatic, typeMember);
        break;
      case StructureKind.PropertySignature:
        classMember = PropertyDeclarationImpl.fromSignature(
          isStatic,
          typeMember,
        );
        break;
    }

    if (map) map.set(classMember, typeMember);
    return classMember;
  }

  /**
   * Add class members as values of this map, using standard keys.
   *
   * @param members - the class members to add.
   */
  public addMembers(members: readonly ClassMemberImpl[]): void {
    members.forEach((member) => {
      this.set(ClassMembersMap.keyFromMember(member), member);
    });
  }

  /**
   * Get class members of a particular kind.
   *
   * @param kind - the structure kind to get.
   * @returns all current members of that kind.
   */
  public arrayOfKind<Kind extends ClassMemberImpl["kind"]>(
    kind: Kind,
  ): Extract<ClassMemberImpl, KindedStructure<Kind>>[] {
    let items = Array.from(this.values());
    items = items.filter((item) => item.kind === kind);
    return items as Extract<ClassMemberImpl, KindedStructure<Kind>>[];
  }

  /** Get a clone of this map. */
  public clone(): ClassMembersMap {
    const members = StructureClassesMap.cloneArray<
      ClassMemberImpl,
      ClassMemberImpl
    >(Array.from(this.values()));

    const newMap = new ClassMembersMap();
    newMap.addMembers(members);
    return newMap;
  }

  /**
   * Convert get and/or set accessors to a property.  This may be lossy, but we try to be faithful.
   * @param isStatic - true if the property is static (and the accessors should be)
   * @param name - the property name
   */
  convertAccessorsToProperty(isStatic: boolean, name: string): void {
    const getter = this.getAsKind<StructureKind.GetAccessor>(
      StructureKind.GetAccessor,
      isStatic,
      name,
    );
    const setter = this.getAsKind<StructureKind.SetAccessor>(
      StructureKind.SetAccessor,
      isStatic,
      name,
    );
    if (!getter && !setter) {
      throw new Error(
        (isStatic ? "static " : "") + name + " accessors not found!",
      );
    }

    if (getter?.decorators.length ?? setter?.decorators.length) {
      throw new Error(
        "accessors have decorators, converting to property decorators is not yet supported",
      );
    }

    const prop = new PropertyDeclarationImpl(
      isStatic,
      getter?.name ?? setter!.name,
    );
    // This is a merge operation: prefer getter fields over setter fields

    const docs = getter?.docs ?? setter!.docs;
    if (docs) {
      prop.docs.push(
        ...StructureClassesMap.cloneArray<
          string | JSDocImpl,
          string | JSDocImpl
        >(docs),
      );
    }

    prop.leadingTrivia.push(
      ...(getter?.leadingTrivia ?? setter!.leadingTrivia),
    );
    prop.scope = getter?.scope ?? setter?.scope;
    prop.trailingTrivia.push(
      ...(getter?.leadingTrivia ?? setter!.leadingTrivia),
    );

    if (getter?.returnTypeStructure) {
      prop.typeStructure = TypeStructureClassesMap.clone(
        getter.returnTypeStructure,
      );
    } else if (setter) {
      const setterParam = setter.parameters[0];
      if (setterParam.typeStructure) {
        prop.typeStructure = TypeStructureClassesMap.clone(
          setterParam.typeStructure,
        );
      }
    }

    this.addMembers([prop]);
    if (getter) {
      this.delete(ClassMembersMap.keyFromMember(getter));
    }
    if (setter) {
      this.delete(ClassMembersMap.keyFromMember(setter));
    }
  }

  /**
   * Convert a property to get and/or set accessors.  This may be lossy, but we try to be faithful.
   * @param isStatic - true if the property is static (and the accessors should be)
   * @param name - the property name
   * @param toGetter - true if the caller wants a getter
   * @param toSetter - true if the caller wants a setter
   */
  convertPropertyToAccessors(
    isStatic: boolean,
    name: string,
    toGetter: boolean,
    toSetter: boolean,
  ): void {
    if (!toGetter && !toSetter)
      throw new Error(
        "You must request either a get accessor or a set accessor!",
      );

    const prop = this.getAsKind<StructureKind.Property>(
      StructureKind.Property,
      isStatic,
      name,
    );
    if (!prop) {
      throw new Error(
        (isStatic ? "static " : "") + name + " property not found!",
      );
    }

    if (prop.decorators.length) {
      throw new Error(
        "property has decorators, converting to accessor decorators is not yet supported",
      );
    }

    if (toGetter) {
      const getter = new GetAccessorDeclarationImpl(
        prop.isStatic,
        prop.name,
        prop.typeStructure,
      );

      if (prop.docs) {
        getter.docs.push(
          ...StructureClassesMap.cloneArray<
            string | JSDocImpl,
            string | JSDocImpl
          >(prop.docs),
        );
      }

      if (prop.isAbstract) {
        getter.isAbstract = true;
      }

      getter.leadingTrivia.push(...prop.leadingTrivia);
      getter.scope = prop.scope;
      getter.trailingTrivia.push(...prop.trailingTrivia);

      this.addMembers([getter]);
    }

    if (toSetter) {
      const param = new ParameterDeclarationImpl("value");
      if (prop.typeStructure)
        param.typeStructure = TypeStructureClassesMap.clone(prop.typeStructure);

      const setter = new SetAccessorDeclarationImpl(
        prop.isStatic,
        prop.name,
        param,
      );

      if (prop.docs) {
        setter.docs.push(
          ...StructureClassesMap.cloneArray<
            string | JSDocImpl,
            string | JSDocImpl
          >(prop.docs),
        );
      }

      if (prop.isAbstract) {
        setter.isAbstract = true;
      }

      setter.leadingTrivia.push(...prop.leadingTrivia);
      setter.scope = prop.scope;
      setter.trailingTrivia.push(...prop.trailingTrivia);

      this.addMembers([setter]);
    }

    this.delete(ClassMembersMap.keyFromMember(prop));
  }

  /**
   * A typed call to `this.get()` for a given kind.
   * @param kind - the structure kind.
   * @param isStatic - true if the member is static.
   * @param name - the name of the member.
   * @returns - the class member, as the right type, or undefined if the wrong type.
   *
   * @see `ClassMembersMap::keyFromName`
   */
  getAsKind<Kind extends ClassMemberImpl["kind"]>(
    kind: Kind,
    isStatic: boolean,
    name: string,
  ): Extract<ClassMemberImpl, KindedStructure<Kind>> | undefined {
    const key = ClassMembersMap.keyFromName(kind, isStatic, name);
    const rv = this.get(key);
    if (rv?.kind === kind)
      return rv as Extract<ClassMemberImpl, KindedStructure<Kind>>;
    return undefined;
  }

  /**
   * Move class members from this map to a class declaration, and clear this map.
   * @param classSettings - a dictionary of optional `ClassDeclarationStructure` properties which this cannot otherwise cover.
   * @returns the new class declaration.
   */
  moveMembersToClass(classDecl: ClassDeclarationImpl): ClassDeclarationImpl {
    this.#validateSettersHaveOneArgumentEach();
    this.forEach((member) => this.#moveMemberToClass(classDecl, member));

    this.clear();

    return classDecl;
  }

  #moveMemberToClass(
    classDecl: ClassDeclarationImpl,
    member: ClassMemberImpl,
  ): void {
    if (member.kind !== StructureKind.Constructor && member.isAbstract)
      classDecl.isAbstract = true;

    switch (member.kind) {
      case StructureKind.Constructor:
        classDecl.ctors.push(member);
        return;

      case StructureKind.Property:
        classDecl.properties.push(member);
        return;

      case StructureKind.GetAccessor:
        classDecl.getAccessors.push(member);
        return;

      case StructureKind.SetAccessor:
        classDecl.setAccessors.push(member);
        return;

      case StructureKind.Method:
        classDecl.methods.push(member);
        return;

      default:
        throw new Error("unreachable");
    }
  }

  /**
   * Move statements from a sequence of statement maps to the class members.
   * @param statementsMaps - the statements to apply to each member, ordered by purpose.
   */
  moveStatementsToMembers(statementsMaps: ClassFieldStatementsMap[]): void {
    this.#validateSettersHaveOneArgumentEach();

    this.forEach((member) =>
      this.#moveStatementToMember(member, statementsMaps),
    );
  }

  #moveStatementToMember(
    member: ClassMemberImpl,
    statementsMaps: ClassFieldStatementsMap[],
  ): void {
    switch (member.kind) {
      case StructureKind.Constructor:
        statementsMaps.forEach((map) =>
          this.#addStatementsToConstructor(member, map),
        );
        return;

      case StructureKind.Property:
        statementsMaps.forEach((map) =>
          this.#addPropertyInitializer(member, map),
        );
        return;

      case StructureKind.GetAccessor:
        statementsMaps.forEach((map) =>
          this.#addStatementsToGetter(member, map),
        );
        return;

      case StructureKind.SetAccessor:
        statementsMaps.forEach((map) =>
          this.#addStatementsToSetter(member, map),
        );
        return;

      case StructureKind.Method:
        statementsMaps.forEach((map) =>
          this.#addStatementsToMethod(member, map),
        );
        return;

      default:
        throw new Error("unreachable");
    }
  }

  #validateSettersHaveOneArgumentEach(): void {
    const setters = this.arrayOfKind<StructureKind.SetAccessor>(
      StructureKind.SetAccessor,
    );
    const missedNames: string[] = [];
    setters.forEach((setter) => {
      if (setter.parameters.length !== 1) {
        missedNames.push(setter.name);
      }
    });
    if (missedNames.length > 0) {
      throw new Error(
        "The following setters do not have exactly one parameter: " +
          missedNames.join(", "),
      );
    }
  }

  #addStatementsToConstructor(
    member: ConstructorDeclarationImpl,
    statementsMap: ClassFieldStatementsMap,
  ): void {
    const statementsDictionary = statementsMap.groupStatementsMap(
      ClassMembersMap.keyFromMember(member),
    );
    if (statementsDictionary) {
      const statements = Array.from(statementsDictionary.values());
      member.statements.push(...statements.flat());
    }
  }

  #addPropertyInitializer(
    member: PropertyDeclarationImpl,
    statementsMap: ClassFieldStatementsMap,
  ): void {
    if (member.isAbstract) return;

    const statementsDictionary = statementsMap.groupStatementsMap(
      ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY,
    );
    if (!statementsDictionary) {
      return;
    }

    const initializer = statementsDictionary.get(
      ClassMembersMap.keyFromMember(member),
    );
    if (!initializer) return;

    if (initializer.length === 1 && typeof initializer[0] !== "object") {
      member.initializer = initializer[0];
      return;
    }

    throw new Error(
      "initializer cannot be more than one statement for property " +
        member.name,
    );
  }

  #addStatementsToGetter(
    member: GetAccessorDeclarationImpl,
    statementsMap: ClassFieldStatementsMap,
  ): void {
    if (member.isAbstract) return;

    const groupName = ClassMembersMap.keyFromMember(member);

    let statementsDictionary = statementsMap.groupStatementsMap(
      ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY,
    );
    if (statementsDictionary) {
      const initializer = statementsDictionary.get(
        groupName.replace("get ", ""),
      );
      if (initializer && initializer.length > 0) {
        member.statements.push(
          `return ${(initializer as string[]).join(" ")};`,
        );
        return;
      }
    }

    statementsDictionary = statementsMap.groupStatementsMap(groupName);
    if (statementsDictionary) {
      const statementsArray = Array.from(statementsDictionary.values()).flat();
      member.statements.push(...statementsArray);
    }
  }

  #addStatementsToSetter(
    member: SetAccessorDeclarationImpl,
    statementsMap: ClassFieldStatementsMap,
  ): void {
    if (member.isAbstract) return;

    const groupName = ClassMembersMap.keyFromMember(member);

    let statementsDictionary = statementsMap.groupStatementsMap(
      ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY,
    );
    if (statementsDictionary) {
      const initializer = statementsDictionary.get(
        groupName.replace("set ", ""),
      );
      if (initializer && initializer.length > 0) {
        member.statements.push(
          `${initializer[0] as string} = ${member.parameters[0].name};`,
        );
        return;
      }
    }

    statementsDictionary = statementsMap.groupStatementsMap(groupName);
    if (statementsDictionary) {
      const statementsArray = Array.from(statementsDictionary.values()).flat();
      member.statements.push(...statementsArray);
    }
  }

  #addStatementsToMethod(
    member: MethodDeclarationImpl,
    statementsMap: ClassFieldStatementsMap,
  ): void {
    if (member.isAbstract) return;

    const groupName = ClassMembersMap.keyFromMember(member);

    const statementsDictionary = statementsMap.groupStatementsMap(groupName);
    if (statementsDictionary) {
      const statements = Array.from(statementsDictionary.values());
      member.statements.push(...statements.flat());
    }
  }

  toJSON(): readonly ClassMemberImpl[] {
    return Array.from(this.values());
  }
}
