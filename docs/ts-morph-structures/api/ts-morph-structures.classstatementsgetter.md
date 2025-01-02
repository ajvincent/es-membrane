<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [ts-morph-structures](./ts-morph-structures.md) &gt; [ClassStatementsGetter](./ts-morph-structures.classstatementsgetter.md)

## ClassStatementsGetter interface

Traps for getting statements, based on a `MemberedStatementsKey`<!-- -->.

**Signature:**

```typescript
export interface ClassStatementsGetter
  extends Partial<PropertyInitializerGetter>,
    Partial<AccessorMirrorGetter>,
    Partial<ClassHeadStatementsGetter>,
    Partial<ClassBodyStatementsGetter>,
    Partial<ClassTailStatementsGetter>,
    Partial<ConstructorHeadStatementsGetter>,
    Partial<ConstructorBodyStatementsGetter>,
    Partial<ConstructorTailStatementsGetter> 
```
**Extends:** Partial&lt;[PropertyInitializerGetter](./ts-morph-structures.propertyinitializergetter.md)<!-- -->&gt;, Partial&lt;[AccessorMirrorGetter](./ts-morph-structures.accessormirrorgetter.md)<!-- -->&gt;, Partial&lt;[ClassHeadStatementsGetter](./ts-morph-structures.classheadstatementsgetter.md)<!-- -->&gt;, Partial&lt;[ClassBodyStatementsGetter](./ts-morph-structures.classbodystatementsgetter.md)<!-- -->&gt;, Partial&lt;[ClassTailStatementsGetter](./ts-morph-structures.classtailstatementsgetter.md)<!-- -->&gt;, Partial&lt;[ConstructorHeadStatementsGetter](./ts-morph-structures.constructorheadstatementsgetter.md)<!-- -->&gt;, Partial&lt;[ConstructorBodyStatementsGetter](./ts-morph-structures.constructorbodystatementsgetter.md)<!-- -->&gt;, Partial&lt;[ConstructorTailStatementsGetter](./ts-morph-structures.constructortailstatementsgetter.md)<!-- -->&gt;

## Properties

<table><thead><tr><th>

Property


</th><th>

Modifiers


</th><th>

Type


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

[keyword](./ts-morph-structures.classstatementsgetter.keyword.md)


</td><td>


</td><td>

readonly string


</td><td>

A human-readable string for debugging.


</td></tr>
<tr><td>

[supportsStatementsFlags](./ts-morph-structures.classstatementsgetter.supportsstatementsflags.md)


</td><td>


</td><td>

readonly number


</td><td>

Bitwise flags to determine which statement getter traps are active.


</td></tr>
</tbody></table>