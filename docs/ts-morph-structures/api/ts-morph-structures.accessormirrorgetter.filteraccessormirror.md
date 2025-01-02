<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [ts-morph-structures](./ts-morph-structures.md) &gt; [AccessorMirrorGetter](./ts-morph-structures.accessormirrorgetter.md) &gt; [filterAccessorMirror](./ts-morph-structures.accessormirrorgetter.filteraccessormirror.md)

## AccessorMirrorGetter.filterAccessorMirror() method

**Signature:**

```typescript
filterAccessorMirror(key: MemberedStatementsKey): boolean;
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

key


</td><td>

[MemberedStatementsKey](./ts-morph-structures.memberedstatementskey.md)


</td><td>

Describing the getter or setter to implement. `statementGroupKey` will be `ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY`<!-- -->.


</td></tr>
</tbody></table>
**Returns:**

boolean

true for a match against the key.
