<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [ts-morph-structures](./ts-morph-structures.md) &gt; [ClassMembersMap](./ts-morph-structures.classmembersmap.md) &gt; [keyFromName](./ts-morph-structures.classmembersmap.keyfromname.md)

## ClassMembersMap.keyFromName() method

**Signature:**

```typescript
static keyFromName(kind: ClassMemberImpl["kind"], isStatic: boolean, name: string): string;
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

kind


</td><td>

[ClassMemberImpl](./ts-morph-structures.classmemberimpl.md)<!-- -->\["kind"\]


</td><td>

the structure kind.


</td></tr>
<tr><td>

isStatic


</td><td>

boolean


</td><td>

true if the class member should be static.


</td></tr>
<tr><td>

name


</td><td>

string


</td><td>

the name of the class member.


</td></tr>
</tbody></table>
**Returns:**

string

the map key to use.

