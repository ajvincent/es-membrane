# ts-morph utilities

## TypeToClass

One of TypeScript's greatest strengths is the ability to transform one object type into another.  Another is enforcing the types on code it compiles to JavaScript.  When you transform one type into another, you'll probably need to generate some classes to either transition from the first type to the second, or to implement the second type.

That said, if you have a parameterized type, or a mapped type, or a conditional type, it can be difficult to figure out what the correct methods are.  The `TypeToClass` utility exists to help.  I built it on top of [ts-morph](https://ts-morph.com/), and users of `TypeToClass` should be somewhat familiar with it, as it provides enough power to get the job done.

### Inputs

`TypeToClass` is a class requiring five basic values.  To the constructor:

1. A destination file from `ts-morph` (which must be empty)
2. A target class name
3. A callback function taking four arguments:
   - The generated class node from `ts-morph`
   - The property name as a string.  (Symbols will be encased in square brackets.)
   - A `ts-morph` `MethodDeclaration` or `PropertyDeclaration` for the property name.
   - A `ts-morph` `TypeAliasDeclaration` or `InterfaceDeclaration` for the type we're iterating over.
   - This callback must return true to preserve the field, or false to tell `TypeToClass` to delete it.
   - For convenience, `TypeToClass` provides a static `buildStatementsCallback(statements)` method to generate this callback with common code in every method.

To the method `addTypeAliasOrInterface()`,

1. A `ts-morph` `SourceFile`
2. The name of an exported type alias or interface in the source file.

### How it works

- In the constructor, `TypeToClass` adds in a "generated code" comment and a default class to export.
- The user calls `addTypeAliasOrInterface`, which gets the list of properties to define from `ts-morph`.
- For each property:
  - Using `ts-morph`, `TypeToClass` creates a stub field, __missing all implementation__.
  - The class calls the user's callback, expecting it to either:
    - populate the field and return true (indicating the field should be kept), or
    - return false (indicating the field should be dropped)
  - If the callback returns false, `TypeToClass` removes the field.
- `TypeToClass` adds an `implements` clause to the generated class, either matching the full type, or `Partial` for the type if not all properties exist.
- `TypeToClass` then asks `ts-morph` to fill in missing imports.
- The user is responsible for saving the destination file when they finish calling on `TypeToClass`.

__The callback is ultimately responsible for implementing the body of each field.__  For a method, you can add content directly using `ts-morph`'s API's.  For a property, you may wish to alter a constructor (no, `TypeToClass` doesn't provide one) to define the property, or set a value directly.  Private and/or static methods are the responsibility of the callback, or of functions it calls.

`TypeToClass` is a _helper_, generating just enough code for the callback to fill in the rest.  If the callback isn't filling in the fields correctly, then TypeScript will not be able to compile the destination file.

_You can call `addTypeAliasOrInterface()` more than once per instance._  If you want to implement multiple types on a class, `TypeToClass` will happily support you in doing so.  If types have conflicting names or property types, you're on your own: TypeScript will not compile your code, and neither `TypeToClass` nor `ts-morph` will necessarily warn you about that footgun.  This you can easily detect ahead of time with an [intersection type alias](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types).

### Why require a type alias or an interface?

This is to reduce the complexity of inputs `TypeToClass` takes.  Sure, it could take more types, but every new type requires more code to implement a class for.  Plus, a type alias is usually inexpensive for the code author.

### Example

This is an oversimplified example, but it should get the point across.  For a more complex type alias, that's where `TypeToClass` should really shine.

```typescript
// in the source file
export type NumberStringType = {
  repeatForward(s: string, n: number): string;
  repeatBack(n: number, s: string): string;
}

// in the file invoking TypeToClass
import ts from "ts-morph";

async function buildNumberStringTypeClass(
  sourceDir: ts.Directory,
  generatedDir: ts.Directory
) : Promise<void>
{
  const srcFile = sourceDir.addSourceFileAtPath("NumberStringType.mts");
  const destFile = generatedDir.createSourceFile("NumberStringTypeClass.mts");

  const TTC = new TypeToClass(
    destFile,
    "NumberStringTypeClass",
    notImplementedCallback
  );

  TTC.addTypeAliasOrInterface(
    srcFile,
    "NumberStringType",
  );

  await destFile.save();
}

const notImplemented = `throw new Error("not yet implemented");`;
function notImplementedCallback
(
  classNode: ts.ClassDeclaration,
  propertyName: string,
  propertyNode: FieldDeclaration,
) : boolean
{
  if (ts.Node.isMethodDeclaration(propertyNode)) {
    propertyNode.addStatements(notImplemented);
  }
  else {
    // This is a property, which I'll turn into getters and setters throwing exceptions.
    const returnType = propertyNode.getTypeNodeOrThrow().getText();

    propertyNode.remove();

    classNode.addGetAccessor({
      name: propertyName,
      statements: notImplemented,
      returnType,
    });

    classNode.addSetAccessor({
      name: propertyName,
      parameters: [{
        name: "value",
        type: returnType
      }],
      statements: notImplemented
    });
  }

  return true;
}

// The resulting destination file's contents after running the above.  You're still responsible for compiling it.
/* This is generated code.  Do not edit directly.
   Instead, edit the types this file imports.
*/
import { NumberStringType } from "../fixtures/NumberStringType.mjs";

export default class NumberStringTypeClass implements NumberStringType {
    repeatForward(s: string, n: number) : string
    {
        void(s);
        void(n);
        throw new Error("not yet implemented");
    }

    repeatBack(n: number, s: string) : string
    {
        void(n);
        void(s);
        throw new Error("not yet implemented");
    }

}
```

[spec-build/support.mts](spec-build/support.mts) has a few more examples.

### Checklist

- [x] Type alias to literal
- [x] Interface split across two declarations
- [x] Multiple types on implementation
- [x] Partial type implementation
- [x] Imported & re-exported type
- [x] Properties of a type as "not implemented" getter
- [x] Properties of a type in a constructor
- [x] Extended interfaces
- [x] Intersection of a referenced type
- [x] Never key in type
- [x] Union of a referenced type (should be illegal)
- [x] Union in arguments of a method (should be legal)
- [x] Parameterized type
- [x] Mapped type
- [x] Conditional type
- [x] Symbol key in type
- [ ] Multiple call signatures (testcase wanted!)
