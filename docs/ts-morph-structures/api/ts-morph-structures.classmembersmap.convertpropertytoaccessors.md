<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [ts-morph-structures](./ts-morph-structures.md) &gt; [ClassMembersMap](./ts-morph-structures.classmembersmap.md) &gt; [convertPropertyToAccessors](./ts-morph-structures.classmembersmap.convertpropertytoaccessors.md)

## ClassMembersMap.convertPropertyToAccessors() method

Convert a property to get and/or set accessors. This may be lossy, but we try to be faithful.

**Signature:**

```typescript
convertPropertyToAccessors(isStatic: boolean, name: string, toGetter: boolean, toSetter: boolean): void;
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

true if the property is static (and the accessors should be)


</td></tr>
<tr><td>

name


</td><td>

string


</td><td>

the property name


</td></tr>
<tr><td>

toGetter


</td><td>

boolean


</td><td>

true if the caller wants a getter


</td></tr>
<tr><td>

toSetter


</td><td>

boolean


</td><td>

true if the caller wants a setter


</td></tr>
</tbody></table>
**Returns:**

void

