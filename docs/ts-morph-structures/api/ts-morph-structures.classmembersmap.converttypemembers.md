<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [ts-morph-structures](./ts-morph-structures.md) &gt; [ClassMembersMap](./ts-morph-structures.classmembersmap.md) &gt; [convertTypeMembers](./ts-morph-structures.classmembersmap.converttypemembers.md)

## ClassMembersMap.convertTypeMembers() method

Creata an array of class members from an array of type members,

**Signature:**

```typescript
static convertTypeMembers(isStatic: boolean, typeMembers: NamedTypeMemberImpl[], map?: WeakMap<ClassMemberImpl, TypeMemberImpl>): NamedClassMemberImpl[];
```

## Parameters

<table><thead><tr><th>

Parameter


</th><th>

Type


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

isStatic


</td><td>

boolean


</td><td>

true if the class members should be static, false if they should not be.


</td></tr>
<tr><td>

typeMembers


</td><td>

[NamedTypeMemberImpl](./ts-morph-structures.namedtypememberimpl.md)<!-- -->\[\]


</td><td>

the type members to convert.


</td></tr>
<tr><td>

map


</td><td>

WeakMap&lt;[ClassMemberImpl](./ts-morph-structures.classmemberimpl.md)<!-- -->, [TypeMemberImpl](./ts-morph-structures.typememberimpl.md)<!-- -->&gt;


</td><td>

_(Optional)_ for defining which type member a class member comes from.


</td></tr>
</tbody></table>
**Returns:**

[NamedClassMemberImpl](./ts-morph-structures.namedclassmemberimpl.md)<!-- -->\[\]
