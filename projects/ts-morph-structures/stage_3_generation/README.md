# Stage 3: Code generation using ts-morph-structures' exported library code

This is the acid test for ts-morph-structures.  Here, I need to create _exactly_, to the byte, the same standard decorators and structures which [stage 2's generation directory](../stage_2_generation/) creates, _without_ simply copying them.  I need to follow the same procedure I did there, using the ts-morph-structures code as much as practical.

Unlike in stage 2, when I was figuring it out as I went along, this time I made a conscious effort to design a properly object-oriented set of build modules, following a specific pattern:

1. [Creating](./build/structureUnions.ts) the [structure unions](../stage_2_snapshot/snapshot/source/types/StructureImplUnions.d.ts) and getting the list of structure names.
2. [Creating the interface modules reflecting ts-morph's decorators and structures](./build/interfaces/createInterfaces.ts).
3. Creating the [decorator modules](./build/decorators/createDecorators.ts) and [structure modules](./build/structures/createStructures.ts), using:

    - a set of [modules representing source module files](./moduleClasses/)
    - ["pseudo-statement structures"](./pseudoStatements/) which the type structure classes inspire
    - ["vanilla" interfaces and unions from ts-morph](./vanilla/), which I represent as `InterfaceDeclarationImpl` instances and arrays of strings, respectively
    - `TypeMembersMap` to combine interfaces into convenient map structures
    - `MemberedTypeToClass` to actually generate the classes, with [class field statement generators](./build/fieldStatements/), starting with a [statements getter base class](./build/fieldStatements/GetterBase.ts)
    - ["special case"](./build/structures/specialCases/) helpers to handle the rare deviations away from what the interfaces naturally provide, such as a `static fromSignature` method, or cleaning up conversions from a property to a getter/setter pair.

In particular, I [tightened the property types of each interface](./build/interfaces/tightenPropertyType.ts) before I fed them to `MemberedTypeToClass`.  This helps a _lot_ in defining what types each _class_ property can be.  It wasn't quite perfect:  whenever I converted a property to a getter ("type"), I often had to call `typeToClass.insertMemberKey()` to make sure the constructor or another method processed the lost property _in the right place_ alphabetically.
