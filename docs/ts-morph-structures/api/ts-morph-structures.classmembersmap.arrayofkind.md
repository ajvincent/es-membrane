<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [ts-morph-structures](./ts-morph-structures.md) &gt; [ClassMembersMap](./ts-morph-structures.classmembersmap.md) &gt; [arrayOfKind](./ts-morph-structures.classmembersmap.arrayofkind.md)

## ClassMembersMap.arrayOfKind() method

Get class members of a particular kind.

**Signature:**

```typescript
arrayOfKind<Kind extends ClassMemberImpl["kind"]>(kind: Kind): Extract<ClassMemberImpl, KindedStructure<Kind>>[];
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

Kind


</td><td>

the structure kind to get.


</td></tr>
</tbody></table>
**Returns:**

Extract&lt;[ClassMemberImpl](./ts-morph-structures.classmemberimpl.md)<!-- -->, KindedStructure&lt;Kind&gt;&gt;\[\]

all current members of that kind.

