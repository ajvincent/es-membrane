<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [ts-morph-structures](./ts-morph-structures.md) &gt; [AddExportContext](./ts-morph-structures.addexportcontext.md)

## AddExportContext interface

A description of the exports to add.

**Signature:**

```typescript
export interface AddExportContext 
```

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

[exportNames](./ts-morph-structures.addexportcontext.exportnames.md)


</td><td>


</td><td>

readonly string\[\]


</td><td>

The names to add to the import. Pass an empty array for "\*".


</td></tr>
<tr><td>

[isDefaultExport](./ts-morph-structures.addexportcontext.isdefaultexport.md)


</td><td>


</td><td>

boolean


</td><td>

True if the import is the default. exportNames will then be the default export name.


</td></tr>
<tr><td>

[isType](./ts-morph-structures.addexportcontext.istype.md)


</td><td>


</td><td>

boolean


</td><td>

True if the export names are types only.


</td></tr>
<tr><td>

[pathToExportedModule](./ts-morph-structures.addexportcontext.pathtoexportedmodule.md)


</td><td>


</td><td>

string


</td><td>

This could be an absolute path, or a package import like "ts-morph-structures".


</td></tr>
</tbody></table>
