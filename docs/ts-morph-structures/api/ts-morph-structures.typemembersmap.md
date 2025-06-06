<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [ts-morph-structures](./ts-morph-structures.md) &gt; [TypeMembersMap](./ts-morph-structures.typemembersmap.md)

## TypeMembersMap class

A map for members of `InterfaceDeclarationImpl` and `MemberedObjectTypeStructureImpl`<!-- -->. This doesn't replace the structures, rather it \_feeds\_ them.

**Signature:**

```typescript
export default class TypeMembersMap extends OrderedMap<string, TypeMemberImpl> 
```
**Extends:** OrderedMap&lt;string, [TypeMemberImpl](./ts-morph-structures.typememberimpl.md)<!-- -->&gt;

## Example

const map = new TypeMembersMap; const foo = new PropertySignatureImpl(false, "foo"); map.addMembers(\[foo\]); // ... const interfaceDecl = new InterfaceDeclarationImpl("FooInterface"); map.moveMembersToType(interfaceDecl); // interfaceDecl.properties === \[foo\];

## Methods

<table><thead><tr><th>

Method


</th><th>

Modifiers


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

[addMembers(members)](./ts-morph-structures.typemembersmap.addmembers.md)


</td><td>


</td><td>

Add type members as values of this map, using standard keys.


</td></tr>
<tr><td>

[arrayOfKind(kind)](./ts-morph-structures.typemembersmap.arrayofkind.md)


</td><td>


</td><td>

Get type members of a particular kind.


</td></tr>
<tr><td>

[clone()](./ts-morph-structures.typemembersmap.clone.md)


</td><td>


</td><td>

Get a clone of this map.


</td></tr>
<tr><td>

[convertAccessorsToProperty(name)](./ts-morph-structures.typemembersmap.convertaccessorstoproperty.md)


</td><td>


</td><td>

Convert get and/or set accessors to a property. This may be lossy, but we try to be faithful.


</td></tr>
<tr><td>

[convertPropertyToAccessors(name, toGetter, toSetter)](./ts-morph-structures.typemembersmap.convertpropertytoaccessors.md)


</td><td>


</td><td>

Convert a property signature to get and/or set accessors. This may be lossy, but we try to be faithful.


</td></tr>
<tr><td>

[fromMemberedObject(membered)](./ts-morph-structures.typemembersmap.frommemberedobject.md)


</td><td>

`static`


</td><td>

Create a `TypeMembersMap` from an interface or membered object.


</td></tr>
<tr><td>

[getAsKind(kind, name)](./ts-morph-structures.typemembersmap.getaskind.md)


</td><td>


</td><td>

A typed call to `this.get()` for a given kind.


</td></tr>
<tr><td>

[keyFromMember(member)](./ts-morph-structures.typemembersmap.keyfrommember.md)


</td><td>

`static`


</td><td>

Get a map key from a potential type member.


</td></tr>
<tr><td>

[keyFromName(kind, name)](./ts-morph-structures.typemembersmap.keyfromname.md)


</td><td>

`static`


</td><td>


</td></tr>
<tr><td>

[moveMembersToType(owner)](./ts-morph-structures.typemembersmap.movememberstotype.md)


</td><td>


</td><td>

Move type members from this map to an interface or type literal, and clear this map.


</td></tr>
<tr><td>

[resolveIndexSignature(signature, names)](./ts-morph-structures.typemembersmap.resolveindexsignature.md)


</td><td>


</td><td>

Replace an index signature with other methods/properties matching the signature's return type.

It is up to you to ensure the names match the key type of the index signature.


</td></tr>
<tr><td>

[toJSON()](./ts-morph-structures.typemembersmap.tojson.md)


</td><td>


</td><td>


</td></tr>
</tbody></table>
