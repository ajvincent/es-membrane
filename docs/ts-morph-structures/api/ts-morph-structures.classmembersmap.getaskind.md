<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [ts-morph-structures](./ts-morph-structures.md) &gt; [ClassMembersMap](./ts-morph-structures.classmembersmap.md) &gt; [getAsKind](./ts-morph-structures.classmembersmap.getaskind.md)

## ClassMembersMap.getAsKind() method

A typed call to `this.get()` for a given kind.

**Signature:**

```typescript
getAsKind<Kind extends ClassMemberImpl["kind"]>(kind: Kind, isStatic: boolean, name: string): Extract<ClassMemberImpl, KindedStructure<Kind>> | undefined;
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

the structure kind.


</td></tr>
<tr><td>

isStatic


</td><td>

boolean


</td><td>

true if the member is static.


</td></tr>
<tr><td>

name


</td><td>

string


</td><td>

the name of the member.


</td></tr>
</tbody></table>
**Returns:**

Extract&lt;[ClassMemberImpl](./ts-morph-structures.classmemberimpl.md)<!-- -->, KindedStructure&lt;Kind&gt;&gt; \| undefined

- the class member, as the right type, or undefined if the wrong type.
