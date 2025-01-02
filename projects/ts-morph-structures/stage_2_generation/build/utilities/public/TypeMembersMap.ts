import {
  KindedStructure,
  StructureKind
} from "ts-morph";

import {
  CallSignatureDeclarationImpl,
  ConstructSignatureDeclarationImpl,
  InterfaceDeclarationImpl,
  IndexSignatureDeclarationImpl,
  MemberedObjectTypeStructureImpl,
  MethodSignatureImpl,
  PropertySignatureImpl,
} from "#stage_one/prototype-snapshot/exports.js";

import OrderedMap from "./OrderedMap.js";

export type TypeMemberImpl = (
  CallSignatureDeclarationImpl |
  ConstructSignatureDeclarationImpl |
  IndexSignatureDeclarationImpl |
  MethodSignatureImpl |
  PropertySignatureImpl
);

export type NamedTypeMemberImpl = Extract<TypeMemberImpl, { name: string }>;

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
    /*
    if (kind === StructureKind.GetAccessorSignature)
      rv += "get ";
    else if (kind === StructureKind.SetAccessorSignature)
      rv += "set ";
    */
    rv += name;
    return rv;
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
  public arrayAsKind<
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

  /**
   * A typed call to `this.get()` for a given kind.
   * @param key - the key to get.
   * @param kind - the structure kind.
   * @returns - the type member, as the right type, or undefined if the wrong type.
   *
   * @see `ClassMembersMap::keyFromName`
   */
  getAsKind<
    Kind extends TypeMemberImpl["kind"]
  >
  (
    key: string,
    kind: Kind
  ): Extract<TypeMemberImpl, KindedStructure<Kind>> | undefined
  {
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
      case StructureKind.IndexSignature:
        owner.indexSignatures.push(member);
        return;
      case StructureKind.MethodSignature:
        owner.methods.push(member);
        return;
      case StructureKind.PropertySignature:
        owner.properties.push(member);
        return;
      default:
        throw new Error("unreachable");
    }
  }
}
