<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [ts-morph-structures](./ts-morph-structures.md) &gt; [TypeMembersMap](./ts-morph-structures.typemembersmap.md) &gt; [arrayOfKind](./ts-morph-structures.typemembersmap.arrayofkind.md)

## TypeMembersMap.arrayOfKind() method

Get type members of a particular kind.

**Signature:**

```typescript
arrayOfKind<Kind extends TypeMemberImpl["kind"]>(kind: Kind): readonly Extract<TypeMemberImpl, KindedStructure<Kind>>[];
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

readonly Extract&lt;[TypeMemberImpl](./ts-morph-structures.typememberimpl.md)<!-- -->, KindedStructure&lt;Kind&gt;&gt;\[\]

all current members of that kind.
