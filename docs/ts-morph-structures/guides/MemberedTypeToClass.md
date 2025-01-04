# "Membered Type To Class" Primer

This package, `ts-morph-structures`, provides helper utilities for building stub classes out of existing TypeScript interfaces and object literals.  

As you might imagine, such a task is not trivial.  There's a lot more in the class than in the combination of the interface and the object literal.  So how do we get from interfaces to classes?

## Concepts

Some of this may seem obvious to any programmer reading this, but it's important to lay out the foundations for why these utilities follow a specific pattern.  If these assumptions don't hold true for your use case, then you may not want to use all of the tools in this particular box.

### We build classes primarily around properties (some of which are private)

Properties of a class represent the actual data of the class.  They are what's specific to a particular instance of a class - or for static properties, what's specific to the class itself.  Everything else in the class builds on top of them (and the base class, of course).

In ts-morph-structures, the [`PropertyDeclarationImpl`](../api/ts-morph-structures.propertydeclarationimpl.md) represents a property structure, and has specific (pun not intended) properties:

- name
- type
- initializer
- isReadonly
- hasQuestionToken ("is it required or optional")
- isAbstract
- isStatic
- and so on.

For type-to-class purposes, we're concerned mostly with "name", "type" and "initializer".

### Constructors, methods and accessors interact with properties via statements

The first part of this is obvious to any programmer, but the most important part here is in the last word.  Without statements (in a particular order), methods are useless.  So are constructors, getters and setters.

### We can organize statements for a method (or constructor, getter or setter) in groups, first by purpose, then by property

By "purpose", I mean "what are we doing in this part?"  It could be one of several tasks:

- Checking class and method preconditions
- Validating arguments
- The actual work of the function:  Processing the arguments and the class fields
- Determining what to return
- Checking class and method postconditions
- Returning a value

Here I'm glossing over "return as early as you can".

### Corollary: We can organize statements by constructor or getter or setter or method, then by purpose, then by the property they care about, then in an ordered array

Yes, four dimensions of statement complexity:

1. Where does a statement go? (constructor / initializer, getter, setter, method)
2. Why does a statement exist? (purpose)
3. What property is that statement most about? (property)
4. What other statements go with that statement, and in what order?  (array of statements)

This becomes really important later ("ClassFieldStatementsMap").

### Definition: "Membered object" = [`InterfaceDeclarationImpl`](../api/ts-morph-structures.interfacedeclarationimpl.md) | [`MemberedObjectTypeStructureImpl`](../api/ts-morph-structures.memberedobjecttypestructureimpl.md)

Both of these implement ts-morph's `TypeElementMemberedNodeStructure` interface, which has several properties:

- `callSignatures`: [`CallSignatureDeclarationImpl[]`](../api/ts-morph-structures.callsignaturedeclarationimpl.md), _`(x: string): void;`_
- `constructSignatures`: [`ConstructSignatureDeclarationImpl[]`](../api/ts-morph-structures.constructsignaturedeclarationimpl.md), _`new (x: string): SomeObject`_
- `getAccessors`: [`GetAccessorDeclarationImpl[]`](../api/ts-morph-structures.getaccessordeclarationimpl.md), _`get y(): number`_
- `indexSignatures`: [`IndexSignatureDeclarationImpl[]`](../api/ts-morph-structures.indexsignaturedeclarationimpl.md), _`[key: string]: boolean;`_
- `methods`: [`MethodSignatureImpl[]`](../api/ts-morph-structures.methodsignatureimpl.md), _`doSomething(value: string): void`_
- `properties`: [`PropertySignatureImpl[]`](../api/ts-morph-structures.propertysignatureimpl.md), _`color: string`_
- `setAccessors`: [`SetAccessorDeclarationImpl[]`](../api/ts-morph-structures.setaccessordeclarationimpl.md), _`set y(value: number);`_

Class structures have a different, partially compatible interface: [`ClassDeclarationImpl`](../api/ts-morph-structures.classdeclarationimpl.md).

- `ctors`: [`ConstructorDeclarationImpl[]`](../api/ts-morph-structures.constructordeclarationimpl.md): _`constructor(color: string) {/* ... */}`_
  - Maybe there is some relation to `ConstructSignatureDeclarationImpl` above, but not in this context right now.  I very much build my own here.
- `getAccessors`: `GetAccessorDeclarationImpl[]`
- `methods`: [`MethodDeclarationImpl[]`](../api/ts-morph-structures.methoddeclarationimpl.md)
- `properties`: [`PropertyDeclarationImpl[]`](../api/ts-morph-structures.propertydeclarationimpl.md)
- `setAccessors`: `SetAccessorDeclarationImpl[]`

`MemberedTypeToClass` and its helpers try to bridge this specific gap.

## Supporting tools

### [`TypeMembersMap`](../api/ts-morph-structures.typemembersmap.md)

A membered object is ideal for serializing (writer functions not withstanding), but for getting a specific member, or for defining one, it's less direct.  `TypeMembersMap` extends `Map<string, TypeMemberImpl>` with the following definition:

```typescript
export type TypeMemberImpl = (
  CallSignatureDeclarationImpl |
  ConstructSignatureDeclarationImpl |
  GetAccessorDeclarationImpl |
  IndexSignatureDeclarationImpl |
  MethodSignatureImpl |
  PropertySignatureImpl |
  SetAccessorDeclarationImpl
);
```

That said, the specific _keys_ of this map are _not_ necessarily the name of the member you have in mind.  Index signatures don't _have_ names, for example.  It's also easy to have a conflict between `get foo()` and a `foo` property.  For this, `TypeMembersMap` provides two static methods:

- `static keyFromMember(member: TypeMemberImpl): string` and
- `static keyFromName(kind: TypeMemberImpl["kind"], name: string): string`

The basic algorithm for creating a key is simple:

1. If the member is a getter, add "get ".
2. If the member is a setter, add "set ".
3. Add the member's name.
4. Return the full key.

Example: `typeMembers.has(TypeMembersMap.keyFromMember(myProperty));`

There are variations for constructors, index signatures and call signatures.

I do not recommend direct access to the map's inherited methods from `Map` unless you fully understand this algorithm.

For convenience, if you already have a membered object, `TypeMembersMap` has another method.

- `static fromMemberedObject(membered): TypeMembersMap`

Individual maps have specific helper methods:

- `addMembers(members: TypeMemberImpl[]): void`
- `arrayOfKind<Kind extends TypeMemberImpl["kind"]>(kind: Kind)`
- `clone(): TypeMembersMap`
- `convertAccessorsToProperty(name: string): void`
- `convertPropertyToAccessors(name: string, toGetter: boolean, toSetter: boolean): void`
- `getAsKind<Kind extends TypeMemberImpl["kind"]>(kind: Kind, name: string)`
- `moveMembersToType(owner: InterfaceDeclarationImpl | MemberedObjectTypeStructureImpl): void`
- `resolveIndexSignature(signature: IndexSignatureDeclarationImpl, names: string[]): void`
- `sortEntries(comparator: (a: [string, TypeMemberImpl], b: [string, TypeMemberImpl]) => number): void;`

The `resolveIndexSignature()` method needs some explanation.  [Index signatures](https://www.typescriptlang.org/docs/handbook/2/objects.html#index-signatures) represent methods and properties, but with variable _names_ for the methods and properties.  Classes require concrete names.  This method lets you provide the concrete names to replace the index signature with.

### [`ClassMembersMap`](../api/ts-morph-structures.classmembersmap.md)

Similar to `TypeMembersMap`, `ClassMembersMap extends Map<string, ClassMemberImpl>`.

```typescript
export type ClassMemberImpl = (
  ConstructorDeclarationImpl |
  PropertyDeclarationImpl |
  GetAccessorDeclarationImpl |
  SetAccessorDeclarationImpl |
  MethodDeclarationImpl
);
```

The key algorithm is similar as well.  The methods for generating keys are:

- `static keyFromMember(member: ClassMemberImpl): string`
- `static keyFromName(kind: ClassMemberImpl["kind"], isStatic: boolean, name: string,): string`

The algorithm for generating a key is:

1. If the member is static, add "static ".
2. If the member is a getter, add "get ".
3. If the member is a setter, add "set ".
4. Add the member's name.
5. Return the full key.

Other static methods:

- `fromClassDeclaration(classDecl: ClassDeclarationImpl): ClassMembersMap`
- `convertTypeMembers(isStatic: boolean, typeMembers: NamedTypeMemberImpl[], map?: WeakMap<ClassMemberImpl, TypeMemberImpl>): NamedClassMemberImpl[]`

The class member map's non-static methods are similar too:

- `addMembers(members: readonly ClassMemberImpl[]): void;`
- `arrayOfKind<Kind extends ClassMemberImpl["kind"]>(kind: Kind);`
- `moveMembersToClass(classDecl: ClassDeclarationImpl): ClassDeclarationImpl;`
- `clone(): ClassMembersMap;`
- `convertAccessorsToProperty(isStatic: boolean, name: string): void;`
- `convertPropertyToAccessors(isStatic: boolean, name: string, toGetter: boolean, toSetter: boolean);`
- `getAsKind<kind extend ClassMemberImpl["kind"]>(kind: Kind, key: string);`
- `moveStatementsToMembers(statementMaps: ClassFieldStatementsMap[]): void;`
- `sortEntries(comparator: (a: [string, ClassMemberImpl], b: [string, ClassMemberImpl]) => number): void;`

The `moveStatementsToMembers()` method requires an explanation of `ClassFieldStatementsMap`.

### [`ClassFieldStatementsMap`](../api/ts-morph-structures.classfieldstatementsmap.md)

Consider the following example:

```typescript
class RedAndBluePlayers {
  #redPoints: number;
  #bluePoints: number;

  constructor(redPoints: number, bluePoints: number) {
  }

  public movePointFromRedToBlue() {
  }

  public movePointFromBlueToRed() {
  }
}
```

Everything above we can get from a `TypeMembersMap`, converting to a `ClassMembersMap` (and adding the constructor to the class map).  What we can't get are the function bodies.  There's a number of statements to consider:

- If we're moving a point from red to blue,
  - Is `this.#redPoints` greater than zero? If not, throw.
  - Add one to `this.#bluePoints`.
  - Subtract one from `this.#redPoints`.
- If we're moving a point from blue to red,
  - Is `this.#bluePoints` greater than zero?  If not, throw.
  - Add one to `this.#redPoints`.
  - Subtract one from `this.#bluePoints`.

We could capture this as follows:

```typescript
const statementsMap = new ClassFieldStatementsMap();
statementsMap.set("_check", "movePointFromRedToBlue", [
  `if (this.#redPoints <= 0) throw new Error("no red points to move");`,
]);
statementsMap.set("_check", "movePointFromBlueToRed", [
  `if (this.#bluePoints <= 0) throw new Error("no blue points to move");`,
]);
statementsMap.set("redPoints", "movePointFromRedToBlue", [
  `this.#redPoints--;`,
]);
statementsMap.set("bluePoints", "movePointFromBlueToRed", [
  `this.#bluePoints++;`,
]);
statementsMap.set("redPoints", "movePointFromBlueToRed", [
  `this.#redPoints++;`,
]);
statementsMap.set("bluePoints", "movePointFromBlueToRed", [
  `this.#bluePoints--;`,
]);
statementsMap.set("redPoints", "constructor", [
  `this.#redPoints = redPoints;`,
]);
statementsMap.set("bluePoints", "constructor", [
  `this.#bluePoints = bluePoints;`,
]);
```

From the above, the class members map could then generate the following code:

```typescript
class RedAndBluePlayers {
  #redPoints: number;
  #bluePoints: number;

  constructor(redPoints: number, bluePoints: number) {
    this.#bluePoints = bluePoints;
    this.#redPoints = redPoints;
  }

  public movePointFromRedToBlue() {
    if (this.#redPoints <= 0) throw new Error("no red points to move");
    this.#bluePoints++;
    this.#redPoints--;
  }

  public movePointFromBlueToRed() {
    if (this.#bluePoints <= 0) throw new Error("no blue points to move");
    this.#bluePoints--;
    this.#redPoints++;
  }
}
```

This is what `ClassFieldStatementsMap` is all about.

Earlier, I mentioned four dimensions of complexity for statements.  `ClassFieldStatementsMap` handles three of them:

- Where does a statement go? (constructor / initializer, getter, setter, method)
- What property is that statement most about? (property)
- What other statements go with that statement, and in what order?  (array of statements)

`ClassFieldStatementsMap` is a _two-keyed_ map, with similar API to `Map<string, ClassFieldStatement[]>`.  It's like saying `Map<string, string, ClassFieldStatement[]>`, although this would be an illegal map definition.  (I derived it from my ["composite-collection"](https://github.com/ajvincent/composite-collection) library, which generates multi-keyed maps and sets.)

- The first key is the property name, or "field name".
  - Special key: `ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL` for statements that must be at the head of a statement group.  (Example: `super.doSomething();`)
  - Special key: `ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN` for statements that must be at the tail of a statement group.  (Example: `return true;`)
  - Otherwise, statements for property names appear in [lexical order](https://en.wikipedia.org/wiki/Lexicographic_order).
- The second key is the function containing the array of statements, the "statement group".
  - Special key: `ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY`.  For properties, this is an initializer for the property.  (Example: `foo: number = 5;`)  For getters and setters, this represents a value to mirror.  (Example: `return this.#foo;`, `this.#foo = value;`)
- The value is the array of statements.

```typescript
export type ClassFieldStatement = string | WriterFunction | StatementStructureImpls;

export type StatementStructureImpls =
  | ClassDeclarationImpl
  | EnumDeclarationImpl
  | ExportAssignmentImpl
  | ExportDeclarationImpl
  | FunctionDeclarationImpl
  | ImportDeclarationImpl
  | InterfaceDeclarationImpl
  | ModuleDeclarationImpl
  | TypeAliasDeclarationImpl
  | VariableStatementImpl;
```

Beyond the standard methods of a `Map`, there are two additional methods specific to statement groups (the second key):

- `groupKeys(): string[]`, returning all the statement group keys.
- `groupStatementsMap(statementGroup: string): ReadonlyMap<string, ClassFieldStatement[]> | undefined`, returning all the field names and statement arrays for a given statement group.

`ClassFieldStatementsMap` exposes other features:

- `purposeKey?: string;`: the purpose key (though this is just a placeholder)
- `regionName?: string;`: `//#region` and `//#endregion` comments around the block for [code folding](https://code.visualstudio.com/docs/editor/codebasics#_folding)
- `isBlockStatement: boolean`: if true, enclose all statements from the map in curly braces.

Other useful methods:

- `static normalizeKeys(fieldName: string, statementGroup: string): [string, string];`
- `static fieldComparator(a: string, b: string): number;` (for sorting statements by field name)

## [`MemberedTypeToClass`](../api/ts-morph-structures.memberedtypetoclass.md): your driver for creating stub classes

Now we get to the center of it all: the `MemberedTypeToClass` class.  Primarily, it has a few tasks, in order:

1. Convert signatures of methods, properties, getters and setters from existing types (`importFromMemberedType()`, `importFromTypeMembersMap()`, `addTypeMember()`)
2. Define a constructor's parameters (which you pass in when calling `new MemberedTypeToClass`)
3. Define callback hooks for:
    - Resolving index signatures (`indexSignatureResolver`)
    - Deciding if a class member is abstract (`isAbstractCallback`)
    - Declaring a class method is asynchronous (`isAsyncCallback`)
    - Declaring a class method is a generator (`isGeneratorCallback`)
    - Declaring a class field's scope ("public", "protected", "private": `scopeCallback`)
4. Defining the class field statement maps (purpose, `isBlockStatement`, optional `regionName`)
5. Adding in additional membered statement keys for properties you replaced with getters and setters (`insertMemberKey`)
6. Define callback hooks for getting statements
7. Building a class members map using all of the above (`buildClassMembersMap()`)

Building a class declaration is trivial, once you have the class members map.  (`.moveMembersToClass(classDecl)`)

### Adding type members

```typescript
declare class MemberedTypeToClass {
  importFromMemberedType(
    isStatic: boolean,
    membered: InterfaceDeclarationImpl | MemberedObjectTypeStructureImpl,
  ): void;

  importFromTypeMembersMap(
    isStatic: boolean,
    membersMap: TypeMembersMap,
  ): void;

  addTypeMember(
    isStatic: boolean,
    member: TypeMemberImpl
  ): void;
}
```

With an [`InterfaceDeclarationImpl`](../api/ts-morph-structures.interfacedeclarationimpl.md) or a [`MemberedObjectTypeStructureImpl`](../api/ts-morph-structures.memberedobjecttypestructureimpl.md), or a `TypeMembersMap`, or an ordinary type member, you can define class members to build.

Please note the type members you define might not be the type members you start with.  For example, your original interface might say:

```typescript
interface ColorSpectrum {
  colors: string | string[]
}
```

But you may want to implement:

```typescript
interface ColorSpectrum {
  colors: string[]
}
```

Here, it's best to:

1. Clone the interface structure
2. Modify the type members of the clone as necessary
3. Feed the cloned interface to `MemberedTypeToClass`

Later, you can use the original interface as part of an `implementsSet` for the class declaration.

### Constructor parameters and adding new class fields, methods, and accessors

```typescript
declare class MemberedTypeToClass {
  /** The class constructor's current parameters list. */
  get constructorParameters(): ParameterDeclarationImpl[];

  /**
   * Add member keys for a field and a group.
   * @param isFieldStatic - true if the field is static.
   * @param fieldType - the field signature.
   * @param isGroupStatic - true if the group is static (false for constructors)
   * @param groupType - the group signature, or "constructor" for the constructor I generate.
   */
  insertMemberKey(
    isFieldStatic: boolean,
    fieldType: PropertySignatureImpl,
    isGroupStatic: boolean,
    groupType: InsertedMemberKey["groupType"]
  ): void;
}

export interface InsertedMemberKey {
  readonly isFieldStatic: boolean;
  readonly fieldType: PropertySignatureImpl;
  readonly isGroupStatic: boolean;
  readonly groupType: (
    GetAccessorDeclarationImpl |
    SetAccessorDeclarationImpl |
    MethodSignatureImpl |
    "constructor" |
    "(initializer or property reference)" /* ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY */
  )
}

export interface MemberedStatementsKey {
  readonly fieldKey: string;
  readonly statementGroupKey: string;
  readonly purpose: string;

  readonly isFieldStatic: boolean;
  readonly fieldType: ReadonlyDeep<TypeMemberImpl> | undefined;

  readonly isGroupStatic: boolean;
  readonly groupType: ReadonlyDeep<TypeMemberImpl> | undefined;
}
```

The `constructorArguments` are the parameters to define on the class constructor, if one is necessary.  (If the constructor has no statements, not even a `super()` call, the class members map will omit the constructor.)  You can also edit the constructor arguments later, via the `constructorParameters` getter.

Sometimes you may need to insert additional statement keys into the set `MemberedTypeToClass` visits.  (The example I can cite is converting a property to a getter/setter pair in a `TypeMembersMap` before the type-to-class code ever sees it.  Getters and setters aren't field keys in the table below, and you may need them to be.)  When you run into this, the `insertMemberKey()` method exists to provide you the under-the-hood support.

Here is a table of the _default_ keys.  You may use `insertMemberKey()` to add your own as you need.

| Field key                              | Statement Group Key                        | Meaning                              |
|----------------------------------------|--------------------------------------------|--------------------------------------|
| _property name_                        | (3)                                        | Initial value for a property         |
| `(static)?` _getter or setter name_    | (3)                                        | A property to mirror                 |
| (1)                                    | `(static)?` _method name_ or `constructor` | Statements leading a statement group |
| _property name_                        | `(static)?` _method name_ or `constructor` | Statements for the property          |
| (2)                                    | `(static)?` _method name_ or `constructor` | Statements closing a statement group |
| (1)                                    | `(static)? get` _getter name_              | Statements leading a statement group |
| _property name_                        | `(static)? get` _getter name_              | Statements for the property          |
| (2)                                    | `(static)? get` _getter name_              | Statements closing a statement group |
| (1)                                    | `(static)? set` _setter name_              | Statements leading a statement group |
| _property name_                        | `(static)? set` _setter name_              | Statements for the property          |
| (2)                                    | `(static)? set` _setter name_              | Statements closing a statement group |

(1): `ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL`

(2): `ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN`

(3): `ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY`

### Adding statements

```typescript
declare class MemberedTypeToClass {
  /**
   * Add statement getters to this.
   *
   * @param priority - a number indicating the priority of the getters (lower numbers beat higher numbers).
   * @param statementGetters - the statement getters to insert.
   */
  addStatementGetters(
    priority: number,
    statementGetters: readonly ClassStatementsGetter[]
  ): void;
}

/**
 * Traps for getting statements, based on a `MemberedStatementsKey`.
 */
export interface ClassStatementsGetter
extends Partial<PropertyInitializerGetter>, Partial<AccessorMirrorGetter>,
Partial<ClassHeadStatementsGetter>, Partial<ClassBodyStatementsGetter>, Partial<ClassTailStatementsGetter>,
Partial<ConstructorHeadStatementsGetter>, Partial<ConstructorBodyStatementsGetter>, Partial<ConstructorTailStatementsGetter>
{
  /** A human-readable string for debugging. */
  keyword: readonly string;

  /**
   * Bitwise flags to determine which statement getter traps are active.
   * @see ClassSupportsStatementsFlags
   */
  supportsStatementsFlags: readonly number;
}

/**
 * Bitwise flags to enable statement getter traps.
 */
export enum ClassSupportsStatementsFlags {
  /** The initial value of a property.*/
  PropertyInitializer = 1 << 0,
  /** Values for a class getter or class setter to mirror. */
  AccessorMirror = 1 << 1,
  /** Statements starting a statement purpose block. */
  HeadStatements = 1 << 2,
  /** Statements in a purpose block for a given property and class member. */
  BodyStatements = 1 << 3,
  /** Statements closing a statement purpose block. */
  TailStatements = 1 << 4,
  /** Statements starting a statement purpose block for the constructor. */
  ConstructorHeadStatements = 1 << 5,
  /** Statements in a purpose block for a given property on the constructor. */
  ConstructorBodyStatements = 1 << 6,
  /** Statements closing a statement purpose block for the constructor. */
  ConstructorTailStatements = 1 << 7,
}
```

This is how we define the actual statements which `MemberedTypeToClass` will retrieve:

- Each statement getter has a `supportsStatementsFlags` property, based on [bitwise operations](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators#bitwise_operators) to enable (and in fact require) callback traps.
- Properties have their initializers through the `PropertyInitializerGetter` interface.
- Getters and setters have values they mirror through the `AccessorMirrorGetter` interface.
- Methods, getters and setters have statements they get, in order of statement purpose via the:
  - `ClassHeadStatementsGetter` interface for statements leading a purpose block
  - `ClassBodyStatementsGetter` interface for statements relating to a class property
  - `ClassTailStatementsGetter` interface for statements closing a purpose block
- Constructors have statements in order of statement purpose via the
  - `ConstructorHeadStatementsGetter` interface for statements leading a purpose block
  - `ConstructorBodyStatementsGetter` interface for statements relating to a class property
  - `ConstructorTailStatementsGetter` interface for statements closing a purpose block

As for the actual statement filters and getters:

```typescript
/**
 * For the initial value of a property.
 *
 * @remarks
 * To run these methods, `this.supportsStatementsFlags & ClassSupportsStatementsFlags.PropertyInitializer` must be non-zero.
 */
export interface PropertyInitializerGetter {
  /**
   * @param key - The property description key.  `statementGroupKey` will be `ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY`.
   * @returns true for a match against the key.
   */
  filterPropertyInitializer(key: MemberedStatementsKey): boolean;

  /**
   * @param key - The property description key.  `statementGroupKey` will be `ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY`.
   * @returns the value to write for the property initializer.
   */
  getPropertyInitializer(
    key: MemberedStatementsKey,
  ): stringWriterOrStatementImpl | undefined;
}

/**
 * A value for getters and setters of a class to reflect.
 *
 * @remarks
 * To run these methods, `this.supportsStatementsFlags & ClassSupportsStatementsFlags.AccessorMirror` must be non-zero.
 */
export interface AccessorMirrorGetter {
  /**
   * @param key - Describing the getter or setter to implement.  `statementGroupKey` will be `ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY`.
   * @returns true for a match against the key.
   */
  filterAccessorMirror(key: MemberedStatementsKey): boolean;

  /**
   * @param key - Describing the getter or setter to implement.  `statementGroupKey` will be `ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY`.
   * @returns the value to write for the getter and/or setter to mirror.
   */
  getAccessorMirror(
    key: MemberedStatementsKey,
  ): stringWriterOrStatementImpl | undefined;
}

/**
 * Statements at the start of a statement purpose block.
 *
 * @remarks
 * To run these methods, `this.supportsStatementsFlags & ClassSupportsStatementsFlags.HeadStatements` must be non-zero.
 */
export interface ClassHeadStatementsGetter {
  /**
   * @param key - The membered statement key.  `fieldKey` will be `ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL`.
   * @returns true for a match against the key.
   */
  filterHeadStatements(key: MemberedStatementsKey): boolean;

  /**
   * @param key - The membered statement key.  `fieldKey` will be `ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL`.
   * @returns statements to insert before other statements in the purpose block.
   */
  getHeadStatements(
    key: MemberedStatementsKey,
  ): readonly stringWriterOrStatementImpl[];
}

/**
 * Statements in a statement purpose block for a particular property and function.
 *
 * @remarks
 * To run these methods, `this.supportsStatementsFlags & ClassSupportsStatementsFlags.BodyStatements` must be non-zero.
 */
export interface ClassBodyStatementsGetter {
  /**
   * @param key - The membered statement key.
   * @returns true for a match against the key.
   */
  filterBodyStatements(key: MemberedStatementsKey): boolean;
  /**
   * @param key - The membered statement key.
   * @returns statements to insert for the given field key and statement group key.
   */
  getBodyStatements(
    key: MemberedStatementsKey,
  ): readonly stringWriterOrStatementImpl[];
}

/**
 * Statements at the end of a statement purpose block.
 *
 * @remarks
 * To run these methods, `this.supportsStatementsFlags & ClassSupportsStatementsFlags.TailStatements` must be non-zero.
 */
export interface ClassTailStatementsGetter {
  /**
   * @param key - The membered statement key.  `fieldKey` will be `ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN`.
   * @returns true for a match against the key.
   */
  filterTailStatements(key: MemberedStatementsKey): boolean;

  /**
   * @param key - The membered statement key.  `fieldKey` will be `ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN`.
   * @returns statements to insert after other statements in the purpose block.
   */
  getTailStatements(
    key: MemberedStatementsKey,
  ): readonly stringWriterOrStatementImpl[];
}

/**
 * Statements at the start of a constructor's statement purpose block.
 *
 * @remarks
 * To run these methods, `this.supportsStatementsFlags & ClassSupportsStatementsFlags.ConstructorHeadStatements` must be non-zero.
 */
export interface ConstructorHeadStatementsGetter {
  /**
   * @param key - The membered statement key.  `fieldKey` will be `ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL`.  `statementGroupKey` will be "constructor".
   * @returns true for a match against the key.
   */
  filterCtorHeadStatements(key: MemberedStatementsKey): boolean;

  /**
   * @param key - The membered statement key.  `fieldKey` will be `ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL`.  `statementGroupKey` will be "constructor".
   * @returns statements to insert before other statements in the purpose block.
   */
  getCtorHeadStatements(
    key: MemberedStatementsKey,
  ): readonly stringWriterOrStatementImpl[];
}

/**
 * Statements in a statement purpose block for a particular property in the constructor.
 *
 * @remarks
 * To run these methods, `this.supportsStatementsFlags & ClassSupportsStatementsFlags.ConstructorBodyStatements` must be non-zero.
 */
export interface ConstructorBodyStatementsGetter {
  /**
   * @param key - The membered statement key.  `statementGroupKey` will be "constructor".
   * @returns true for a match against the key.
   */
  filterCtorBodyStatements(key: MemberedStatementsKey): boolean;

  /**
   * @param key - The membered statement key.  `statementGroupKey` will be "constructor".
   * @returns statements to insert for the given field key and statement group key.
   */
  getCtorBodyStatements(
    key: MemberedStatementsKey,
  ): readonly stringWriterOrStatementImpl[];
}

/**
 * Statements at the end of a constructor's statement purpose block.
 *
 * @remarks
 * To run these methods, `this.supportsStatementsFlags & ClassSupportsStatementsFlags.ConstructorTailStatements` must be non-zero.
 */
export interface ConstructorTailStatementsGetter {
  /**
   * @param key - The membered statement key.  `fieldKey` will be `ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN`.  `statementGroupKey` will be "constructor".
   * @returns true for a match against the key.
   */
  filterCtorTailStatements(key: MemberedStatementsKey): boolean;

  /**
   * @param key - The membered statement key.  `fieldKey` will be `ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN`.  `statementGroupKey` will be "constructor".
   * @returns statements to insert before other statements in the purpose block.
   */
  getCtorTailStatements(
    key: MemberedStatementsKey,
  ): readonly stringWriterOrStatementImpl[];
}

```

Mirroring the above table:

| Field key                           | Statement Group Key           | Interface                         |
|-------------------------------------|-------------------------------|-----------------------------------|
| _property name_                     | (3)                           | `PropertyInitializerGetter`       |
| `(static)?` _getter or setter name_ | (3)                           | `AccessorMirrorGetter`            |
| (1)                                 | `(static)?` _method name_     | `ClassHeadStatementsGetter`       |
| _property name_                     | `(static)?` _method name_     | `ClassBodyStatementsGetter`       |
| (2)                                 | `(static)?` _method name_     | `ClassTailStatementsGetter`       |
| (1)                                 | `(static)? get` _getter name_ | `ClassHeadStatementsGetter`       |
| _property name_                     | `(static)? get` _getter name_ | `ClassBodyStatementsGetter`       |
| (2)                                 | `(static)? get` _getter name_ | `ClassTailStatementsGetter`       |
| (1)                                 | `(static)? set` _setter name_ | `ClassHeadStatementsGetter`       |
| _property name_                     | `(static)? set` _setter name_ | `ClassBodyStatementsGetter`       |
| (2)                                 | `(static)? set` _setter name_ | `ClassTailStatementsGetter`       |
| (1)                                 | `constructor`                 | `ConstructorHeadStatementsGetter` |
| _property name_                     | `constructor`                 | `ConstructorBodyStatementsGetter` |
| (2)                                 | `constructor`                 | `ConstructorTailStatementsGetter` |

(1): `ClassFieldStatementsMap.FIELD_HEAD_SUPER_CALL`

(2): `ClassFieldStatementsMap.FIELD_TAIL_FINAL_RETURN`

(3): `ClassFieldStatementsMap.GROUP_INITIALIZER_OR_PROPERTY`

### Callback hooks

The callbacks each provide useful information to `MemberedTypeToClass`.  In simplified pseudo-code,

```typescript
export interface IndexSignatureResolver {
  resolveIndexSignature(signature: IndexSignatureDeclarationImpl): string[];
}

export interface ClassAbstractMemberQuestion {
  isAbstract(kind: ClassMemberType["kind"], memberName: string): boolean;
}

export interface ClassAsyncMethodQuestion {
  isAsync(isStatic: boolean, memberName: string): boolean;
}

export interface ClassGeneratorMethodQuestion {
  isGenerator(isStatic: boolean, memberName: string): boolean;
}

export interface ClassScopeMemberQuestion {
  getScope(isStatic: boolean, kind: ClassMemberImpl["kind"], memberName: string): Scope | undefined
}

declare class MemberedTypeToClass {
  indexSignatureResolver?: IndexSignatureResolver;
  isAbstractCallback?: ClassAbstractMemberQuestion;
  isAsyncCallback?: ClassAsyncMethodQuestion;
  isGeneratorCallback?: ClassGeneratorMethodQuestion;
  scopeCallback?: ClassScopeMemberQuestion;
}
```

### Defining class field statement maps

```typescript

declare class MemberedTypeToClass {
  defineStatementsByPurpose(
    purposeKey: string,
    isBlockStatement: boolean,
    regionName?: string,
  ): void;
}
```

These allow you to define each `ClassFieldStatementMap`, in the order you wish the statemeent blocks to appear by purpose.

### Building a class members map

```typescript
declare class MemberedTypeToClass {
  buildClassMembersMap(): ClassMembersMap;
}
```

Note this is the final part of the process:  after invoking this, none of the other methods of `MemberedTypeToClass` should work.

After this, you usually would call `.moveMembersToClass(classDecl)` on the `ClassMembersMap`.

## Suggested practices (not "best" because this is still new)

- Define your type members strictly, or narrow existing types via cloning.  The class members' definitions I infer directly from the type members you pass in.
- Give your purpose keys meaningful names.  "one", "two", "three" are less useful than "precondition", "argumentValidation", "processing".
- Decide carefully whether you want to use "isBlockStatement" on purpose blocks.  Curly braces affect the scope of `const` and `let` variable declarations.
  - Region names, on the other hand, are comments and won't affect scope.

## What's not part of this?

### Class member sorting / organization, mixing class field types

This is because ts-morph provides no mechanism for organizing class members from a structure.  You give ts-morph a `ClassDeclarationStructure`, and it decides for you where to put the members.  Properties appear in one group, methods in another, getters and setters in another.  It's outside my control.

### Pretty-printing of statements

What you put in, you get out.  I provide the ts-morph structures, but I don't try to format the outputs beyond common sense.  Once they go into a ts-morph node, it's up to you to use utilities like ts-morph or Prettier to clean up the output.

### A "satisfies" statement for the class

Some time ago, [a TypeScript bug on "static implements"](https://github.com/microsoft/TypeScript/issues/33892) inspired me to add `Foo satisfies CloneableStructure<FooType>` statements after my classes, to type-check static fields.  `ClassDeclarationImpl` doesn't support that (yet), though I could see that being very useful.

### Rigorous validation of inputs

You can do dumb things with ts-morph-structures, like provide a getter and a property with the same name.  You can do the same dumb things with ts-morph.  The utilities here don't try very hard to protect you from this.

## Enjoy

Please, let me know of any pain points you encounter - and suggestions for improving them.  Unlike the structure classes, these are more complex.  I can add new features as necessary.
