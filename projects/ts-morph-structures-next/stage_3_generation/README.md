# Stage 3: Code generation using ts-morph-structures' exported library code

This is the acid test for ts-morph-structures.  Here, I need to create _exactly_, to the byte, the same standard decorators and structures which [stage 2's generation directory](../stage_2_generation/) creates, _without_ simply copying them.  I need to follow the same procedure I did there, using the ts-morph-structures code as much as practical.

Like stage 2, I follow a specific pattern:

1. [Creating](./build/structureUnions.ts) the [structure unions](../stage_2_snapshot/snapshot/source/types/StructureImplUnions.d.ts) and getting the list of structure names.
2. [Creating the interface modules reflecting ts-morph's decorators and structures](./build/interfaces/createInterfaces.ts).
3. Creating the [decorator modules](./build/decorators/createDecorators.ts) and [structure modules](./build/structures/createStructures.ts), using:

    - a set of [modules representing source module files](./moduleClasses/)
    - ["pseudo-expression structures"](./pseudoExpressions/statements/) which the type structure classes inspire
    - ["vanilla" interfaces and unions from ts-morph](./vanilla/), which I represent as `InterfaceDeclarationImpl` instances and arrays of strings, respectively
    - `TypeMembersMap` to combine interfaces into convenient map structures
    - `MemberedTypeToClass` to actually generate the classes, with [class field statement generators](./build/fieldStatements/), starting with a [statements getter base class](./build/fieldStatements/GetterBase.ts)
    - ["special case"](./build/structures/specialCases/) helpers to handle the rare deviations away from what the interfaces naturally provide, such as a `static fromSignature` method, or cleaning up conversions from a property to a getter/setter pair.

In particular, I [tightened the property types of each interface](./build/interfaces/tightenPropertyType.ts) before I fed them to `MemberedTypeToClass`.  This helps a _lot_ in defining what types each _class_ property can be.  It wasn't quite perfect:  whenever I converted a property to a getter ("type"), I often had to call `typeToClass.insertMemberKey()` to make sure the constructor or another method processed the lost property _in the right place_ alphabetically.

### Special cases: use `StructureModifiersMap`

More recently, I've begun implementing hooks in the module builds in the build process, for special-case modifications to the objects we work with.  [StructureModifiersMap](./build/structures/specialCases/modifiers/map.ts) is for this purpose.

## Public and internal exports

We have to write our public exports file before all the exports necessarily exist.  Ditto for the internal exports, which are (hopefully) not exported to users.  So I include the [export managers](./build/ExportManager.ts) for these through each decorator and structure hook, so they can add the values they each export along the way.

That doesn't cover all of the exports, though.  I have [a special module for defining additional exports](./build/publicAndInternalExports.ts) after the hooks have done their work.  In particular, these hand-written exports belong to the stage 2 integration directory.
