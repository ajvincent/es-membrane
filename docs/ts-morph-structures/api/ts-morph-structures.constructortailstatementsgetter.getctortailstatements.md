<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [ts-morph-structures](./ts-morph-structures.md) &gt; [ConstructorTailStatementsGetter](./ts-morph-structures.constructortailstatementsgetter.md) &gt; [getCtorTailStatements](./ts-morph-structures.constructortailstatementsgetter.getctortailstatements.md)

## ConstructorTailStatementsGetter.getCtorTailStatements() method

**Signature:**

```typescript
getCtorTailStatements(
    key: MemberedStatementsKey,
  ): readonly stringWriterOrStatementImpl[];
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

The membered statement key. `fieldKey` will be `ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN`<!-- -->. `statementGroupKey` will be "constructor".


</td></tr>
</tbody></table>
**Returns:**

readonly [stringWriterOrStatementImpl](./ts-morph-structures.stringwriterorstatementimpl.md)<!-- -->\[\]

statements to insert before other statements in the purpose block.

