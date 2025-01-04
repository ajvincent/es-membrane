import assert from "node:assert/strict";

import {
  type KindedStructure,
  StructureKind
} from "ts-morph";

import type {
  Simplify
} from "type-fest";

import {
  GetAccessorDeclarationImpl,
  JSDocImpl,
  InterfaceDeclarationImpl,
  IndexSignatureDeclarationImpl,
  FunctionTypeStructureImpl,
  LiteralTypeStructureImpl,
  MemberedObjectTypeStructureImpl,
  MethodSignatureImpl,
  type NamedTypeMemberImpl,
  ParameterDeclarationImpl,
  ParameterTypeStructureImpl,
  PropertySignatureImpl,
  SetAccessorDeclarationImpl,
  type TypeMemberImpl,
  TypeStructureKind,
  TypeStructures,
  UnionTypeStructureImpl,
} from "../../snapshot/source/exports.js";

import {
  StructureClassesMap,
  TypeStructureClassesMap,
} from "../../snapshot/source/internal-exports.js";

import OrderedMap from "./OrderedMap.js";

/**
 * A map for members of `InterfaceDeclarationImpl` and `MemberedObjectTypeStructureImpl`.  This
 * doesn't replace the structures, rather it _feeds_ them.
 *
 * @example
 *
 * const map = new TypeMembersMap;
 * const foo = new PropertySignatureImpl(false, "foo");
 * map.addMembers([foo]);
 * // ...
 * const interfaceDecl = new InterfaceDeclarationImpl("FooInterface");
 * map.moveMembersToType(interfaceDecl);
 * // interfaceDecl.properties === [foo];
 */
export default class TypeMembersMap
extends OrderedMap<string, TypeMemberImpl>
{
  static readonly #uniqueKey = new WeakMap<TypeMemberImpl, string>;
  static #uniqueKeyCounter = 0;

  /**
   * Get a map key from a potential type member.
   * @param member - the type member
   */
  static keyFromMember(
    member: TypeMemberImpl
  ): string
  {
    let key = TypeMembersMap.#uniqueKey.get(member);
    if (key)
      return key;

    key = TypeMembersMap.#keyFromMember(member);
    TypeMembersMap.#uniqueKey.set(member, key);
    return key;
  }

  static #keyFromMember(
    member: TypeMemberImpl
  ): string
  {
    if (member.kind === StructureKind.ConstructSignature)
      return "constructor";
    if (member.kind === StructureKind.IndexSignature)
      return `(index ${TypeMembersMap.#uniqueKeyCounter++})`;
    if (member.kind === StructureKind.CallSignature)
      return `(callsignature ${TypeMembersMap.#uniqueKeyCounter++})`;
    return this.keyFromName(member.kind, member.name);
  }

  /**
   * @param kind - the structure kind.
   * @param name - the name of the type member.
   * @returns the map key to use.
   */
  static keyFromName(
    kind: NamedTypeMemberImpl["kind"],
    name: string,
  ): string
  {
    let rv = "";
    if (kind === StructureKind.GetAccessor)
      rv += "get ";
    else if (kind === StructureKind.SetAccessor)
      rv += "set ";
    rv += name;
    return rv;
  }

  /**
   * Create a `TypeMembersMap` from an interface or membered object.
   * @param membered - the membered object.
   * @returns the type members map.
   */
  static fromMemberedObject(
    membered: InterfaceDeclarationImpl | MemberedObjectTypeStructureImpl
  ): TypeMembersMap
  {
    const map = new TypeMembersMap;

    const members: TypeMemberImpl[] = [
      ...membered.callSignatures,
      ...membered.constructSignatures,
      ...membered.getAccessors,
      ...membered.indexSignatures,
      ...membered.methods,
      ...membered.properties,
      ...membered.setAccessors,
    ];
    map.addMembers(members);

    return map;
  }

  static #convertParameterFromTypeToImpl(
    source: ParameterTypeStructureImpl
  ): ParameterDeclarationImpl
  {
    const impl = new ParameterDeclarationImpl(source.name);
    if (source.typeStructure)
      impl.typeStructure = TypeStructureClassesMap.clone(source.typeStructure);
    return impl;
  }

  /**
   * Add type members as values of this map, using standard keys.
   *
   * @param members - the type members to add.
   */
  public addMembers(
    members: readonly TypeMemberImpl[]
  ): void
  {
    members.forEach(member => {
      this.set(TypeMembersMap.keyFromMember(member), member)
    });
  }

  /**
   * Get type members of a particular kind.
   *
   * @param kind - the structure kind to get.
   * @returns all current members of that kind.
   */
  public arrayOfKind<
    Kind extends TypeMemberImpl["kind"]
  >
  (
    kind: Kind
  ): readonly (Extract<TypeMemberImpl, KindedStructure<Kind>>)[]
  {
    let items = Array.from(this.values());
    items = items.filter(item => item.kind === kind);
    return items as (Extract<TypeMemberImpl, KindedStructure<Kind>>)[];
  }

  /** Get a clone of this map. */
  public clone(): TypeMembersMap
  {
    const members = StructureClassesMap.cloneArray<
      TypeMemberImpl, TypeMemberImpl
    >(Array.from(this.values()));

    const newMap = new TypeMembersMap;
    newMap.addMembers(members);
    return newMap;
  }

  /**
   * Convert get and/or set accessors to a property.  This may be lossy, but we try to be faithful.
   * @param name - the property name
   */
  convertAccessorsToProperty(
    name: string
  ): void
  {
    const getter = this.getAsKind<StructureKind.GetAccessor>(StructureKind.GetAccessor, name);
    const setter = this.getAsKind<StructureKind.SetAccessor>(StructureKind.SetAccessor, name);
    if (!getter && !setter) {
      throw new Error(name + " accessors not found!");
    }

    const prop = new PropertySignatureImpl(getter?.name ?? setter!.name);
    // This is a merge operation: prefer getter fields over setter fields

    const docs = getter?.docs ?? setter!.docs;
    if (docs) {
      prop.docs.push(...StructureClassesMap.cloneArray<string | JSDocImpl, string | JSDocImpl>(docs));
    }

    prop.leadingTrivia.push(...(getter?.leadingTrivia ?? setter!.leadingTrivia));
    prop.trailingTrivia.push(...(getter?.leadingTrivia ?? setter!.leadingTrivia));

    if (getter?.returnTypeStructure) {
      prop.typeStructure = TypeStructureClassesMap.clone(getter.returnTypeStructure);
    }
    else if (setter) {
      const setterParam = setter.parameters[0];
      if (setterParam.typeStructure) {
        prop.typeStructure = TypeStructureClassesMap.clone(setterParam.typeStructure);
      }
    }

    this.addMembers([prop]);
    if (getter) {
      this.delete(TypeMembersMap.keyFromMember(getter));
    }
    if (setter) {
      this.delete(TypeMembersMap.keyFromMember(setter));
    }
  }

  /**
   * Convert a property signature to get and/or set accessors.  This may be lossy, but we try to be faithful.
   * @param name - the property name
   * @param toGetter - true if the caller wants a getter
   * @param toSetter - true if the caller wants a setter
   */
  convertPropertyToAccessors(
    name: string,
    toGetter: boolean,
    toSetter: boolean
  ): void
  {
    if (!toGetter && !toSetter)
      throw new Error("You must request either a get accessor or a set accessor!");

    const prop = this.getAsKind<StructureKind.PropertySignature>(StructureKind.PropertySignature, name);
    if (!prop) {
      throw new Error(name + " property not found!");
    }

    if (toGetter) {
      const getter = new GetAccessorDeclarationImpl(false, prop.name, prop.typeStructure);
      if (prop.docs) {
        getter.docs.push(...StructureClassesMap.cloneArray<string | JSDocImpl, string | JSDocImpl>(prop.docs));
      }

      getter.leadingTrivia.push(...prop.leadingTrivia);
      getter.trailingTrivia.push(...prop.trailingTrivia);

      if (prop.hasQuestionToken && getter.returnTypeStructure) {
        getter.returnTypeStructure = TypeMembersMap.#getUnionWithUndefined(getter.returnTypeStructure);
      }

      this.addMembers([getter]);
    }

    if (toSetter) {
      const param = new ParameterDeclarationImpl("value");
      if (prop.typeStructure)
        param.typeStructure = TypeStructureClassesMap.clone(prop.typeStructure);

      const setter = new SetAccessorDeclarationImpl(false, prop.name, param);

      if (prop.docs) {
        setter.docs.push(...StructureClassesMap.cloneArray<string | JSDocImpl, string | JSDocImpl>(prop.docs))
      }

      setter.leadingTrivia.push(...prop.leadingTrivia);
      setter.trailingTrivia.push(...prop.trailingTrivia);

      if (prop.hasQuestionToken && param.typeStructure) {
        param.typeStructure = TypeMembersMap.#getUnionWithUndefined(param.typeStructure);
      }

      this.addMembers([setter]);
    }

    this.delete(TypeMembersMap.keyFromMember(prop));
  }

  static #getUnionWithUndefined(
    typeStructure: TypeStructures
  ): UnionTypeStructureImpl
  {
    if (typeStructure.kind !== TypeStructureKind.Union) {
      typeStructure = new UnionTypeStructureImpl([typeStructure]);
    }

    const undefType = LiteralTypeStructureImpl.get("undefined");
    if (typeStructure.childTypes.includes(undefType) === false)
      typeStructure.childTypes.push(undefType);

    return typeStructure;
  }

  /**
   * A typed call to `this.get()` for a given kind.
   * @param kind - the structure kind.
   * @param name - the key to get.
   * @returns - the type member, as the right type, or undefined if the wrong type.
   *
   * @see `TypeMembersMap::keyFromName`
   */
  getAsKind<
    Kind extends NamedTypeMemberImpl["kind"]
  >
  (
    kind: Kind,
    name: string,
  ): Extract<TypeMemberImpl, KindedStructure<Kind>> | undefined
  {
    const key = TypeMembersMap.keyFromName(kind, name);
    const rv = this.get(key);
    if (rv?.kind === kind)
      return rv as Extract<TypeMemberImpl, KindedStructure<Kind>>;
    return undefined;
  }

  /**
   * Move type members from this map to an interface or type literal, and clear this map.
   *
   * @param owner - the target interface or type literal declaration.
   */
  moveMembersToType(
    owner: InterfaceDeclarationImpl | MemberedObjectTypeStructureImpl
  ): void
  {
    this.forEach(member => this.#moveMemberToOwner(owner, member));
    this.clear();
  }

  #moveMemberToOwner(
    owner: InterfaceDeclarationImpl | MemberedObjectTypeStructureImpl,
    member: TypeMemberImpl
  ): void
  {
    switch (member.kind) {
      case StructureKind.CallSignature:
        owner.callSignatures.push(member);
        return;
      case StructureKind.ConstructSignature:
        owner.constructSignatures.push(member);
        return;
      case StructureKind.GetAccessor:
        owner.getAccessors.push(member);
        return;
      case StructureKind.IndexSignature:
        owner.indexSignatures.push(member);
        return;
      case StructureKind.MethodSignature:
        owner.methods.push(member);
        return;
      case StructureKind.PropertySignature:
        owner.properties.push(member);
        return;
      case StructureKind.SetAccessor:
        owner.setAccessors.push(member);
        return;
      default:
        throw new Error("unreachable");
    }
  }

  /**
   * Replace an index signature with other methods/properties matching the signature's return type.
   *
   * It is up to you to ensure the names match the key type of the index signature.
   *
   * @param signature - the signature (which must be a member of this) to resolve.
   * @param names - the names to replace the signature's key with.
   */
  resolveIndexSignature(
    signature: IndexSignatureDeclarationImpl,
    names: string[]
  ): MethodSignatureImpl[] | PropertySignatureImpl[]
  {
    const indexKey = TypeMembersMap.keyFromMember(signature);
    if (!this.has(indexKey))
      throw new Error("index signature is not part of this");

    if (
      (typeof signature.returnTypeStructure === "object") &&
      (signature.returnTypeStructure?.kind === TypeStructureKind.Function) &&
      !signature.isReadonly
    )
    {
      return this.#resolveIndexSignatureToMethods(signature, names, indexKey);
    }

    return this.#resolveIndexSignatureToProperties(signature, names, indexKey);
  }

  #resolveIndexSignatureToMethods(
    signature: IndexSignatureDeclarationImpl,
    names: string[],
    indexKey: string
  ): MethodSignatureImpl[]
  {
    const baseMethodSignature = new MethodSignatureImpl("");
    const { returnTypeStructure } = signature;
    assert(returnTypeStructure instanceof FunctionTypeStructureImpl, "how'd we get here?");

    returnTypeStructure.typeParameters.forEach(typeParam => {
      baseMethodSignature.typeParameters.push(typeParam);
    });
    returnTypeStructure.parameters.forEach(param => {
      baseMethodSignature.parameters.push(
        TypeMembersMap.#convertParameterFromTypeToImpl(param));
    });
    if (returnTypeStructure.restParameter) {
      const restParameter = TypeMembersMap.#convertParameterFromTypeToImpl(returnTypeStructure.restParameter);
      restParameter.isRestParameter = true;
      baseMethodSignature.parameters.push(restParameter);
    }

    if (returnTypeStructure.returnType)
      baseMethodSignature.returnTypeStructure = returnTypeStructure.returnType;

    const addedMembers: MethodSignatureImpl[] = [];

    names.forEach(name => {
      const methodSignature = MethodSignatureImpl.clone(baseMethodSignature);
      methodSignature.name = name;
      addedMembers.push(methodSignature);
    });

    this.addMembers(addedMembers);
    this.delete(indexKey);
    return addedMembers;
  }

  #resolveIndexSignatureToProperties(
    signature: IndexSignatureDeclarationImpl,
    names: string[],
    indexKey: string,
  ): PropertySignatureImpl[]
  {
    const baseProp = new PropertySignatureImpl("");
    if (signature.isReadonly)
      baseProp.isReadonly = true;
    if (signature.returnTypeStructure)
      baseProp.typeStructure = signature.returnTypeStructure;

    const addedMembers: PropertySignatureImpl[] = [];

    names.forEach(name => {
      const prop = PropertySignatureImpl.clone(baseProp);
      prop.name = name;
      addedMembers.push(prop);
    });
    this.addMembers(addedMembers);
    this.delete(indexKey);

    return addedMembers;
  }

  toJSON(): readonly TypeMemberImpl[] {
    return Array.from(this.values());
  }
}

export type ReadonlyTypeMembersMap = Simplify<
  ReadonlyMap<string, TypeMemberImpl> &
  Pick<TypeMembersMap, "arrayOfKind" | "clone" | "getAsKind">
>;
