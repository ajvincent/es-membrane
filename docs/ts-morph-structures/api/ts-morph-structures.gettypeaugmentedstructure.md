<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [ts-morph-structures](./ts-morph-structures.md) &gt; [getTypeAugmentedStructure](./ts-morph-structures.gettypeaugmentedstructure.md)

## getTypeAugmentedStructure() function

Get a structure for a node, with type structures installed throughout its descendants.

**Signature:**

```typescript
declare function getTypeAugmentedStructure(rootNode: NodeWithStructures, userConsole: TypeNodeToTypeStructureConsole, assertNoFailures: boolean): RootStructureWithConvertFailures;
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

rootNode


</td><td>

NodeWithStructures


</td><td>

The node to start from.


</td></tr>
<tr><td>

userConsole


</td><td>

[TypeNodeToTypeStructureConsole](./ts-morph-structures.typenodetotypestructureconsole.md)


</td><td>

a callback for conversion failures.


</td></tr>
<tr><td>

assertNoFailures


</td><td>

boolean


</td><td>

if true, assert there are no conversion failures.


</td></tr>
</tbody></table>
**Returns:**

RootStructureWithConvertFailures

the root structure, the root node, and any failures during recursion.
