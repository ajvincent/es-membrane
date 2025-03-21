<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [ts-morph-structures](./ts-morph-structures.md) &gt; [ExportManager](./ts-morph-structures.exportmanager.md)

## ExportManager class

This manages export declarations and specifiers, for including in a source file.

**Signature:**

```typescript
export default class ExportManager 
```

## Example


```typescript
publicExports.addExports({
  pathToExportedModule: path.join(distDir, "source/toolbox/ExportManager.ts"),
  exportNames: ["ExportManager"],
  isDefaultExport: true,
  isType: false,
});
// ...
sourceFile.statements.push(...publicExports.getDeclarations());
```

## Constructors

<table><thead><tr><th>

Constructor


</th><th>

Modifiers


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

[(constructor)(absolutePathToExportFile)](./ts-morph-structures.exportmanager._constructor_.md)


</td><td>


</td><td>

Constructs a new instance of the `ExportManager` class


</td></tr>
</tbody></table>

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

[absolutePathToExportFile](./ts-morph-structures.exportmanager.absolutepathtoexportfile.md)


</td><td>

`readonly`


</td><td>

string


</td><td>

Where the file will live on the file system.


</td></tr>
</tbody></table>

## Methods

<table><thead><tr><th>

Method


</th><th>

Modifiers


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

[addExports(context)](./ts-morph-structures.exportmanager.addexports.md)


</td><td>


</td><td>


</td></tr>
<tr><td>

[getDeclarations()](./ts-morph-structures.exportmanager.getdeclarations.md)


</td><td>


</td><td>

Get the export declarations, sorted by path to file, then internally by specified export values.


</td></tr>
</tbody></table>
