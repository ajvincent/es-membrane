# When to use this library, versus direct ts-morph interaction

First, I'll direct you to [ts-morph's Performance page](https://ts-morph.com/manipulation/performance), where the first tip is "work with structures instead".  I couldn't agree more.  My own experience suggested quadratic time performance in modifying the same file repeatedly using ts-morph directly.  (Admittedly this was sometime in 2022 or 2023.)

1. If you trust yourself to write your output without ts-morph, do so.
2. If you are doing small tweaks without needing to build new AST nodes, use ts-morph.
3. If your task is really simple and short to do with ts-morph, use ts-morph.
4. If you are creating new AST nodes, consider ts-morph-structures to feed ts-morph.
5. If you are doing complex manipulations, consider ts-morph-structures to replace nodes in ts-morph.

This really boils down to "the right tool for the job".  Namely, "is it better to do it by hand, or to combine inputs and functions to create an output?"

For example, if you have an existing interface (especially one you do not control) and you want to build a class from it, ts-morph-structures provides a [type-to-class set of tools](MemberedTypeToClass.md) to help you do so.  Doing this directly in ts-morph is possible but complex:

- Defining the class structure
  - Properties, each of which have their own structure
  - Methods, each of which have their own structure
    - Parameters, each with their own structure
    - A return type
    - Statements
  - Getters and setters and constructors
    - Everything you have for methods here
- Imports for the file you're working with [(I have tools for this too)](./ImportsAndExports.md)

On the other hand, if all you're doing is setting a return type on a class method, maybe ts-morph-structures _isn't_ the right tool for this.  You can do this by hand:

```typescript
const returnType = new TypeArgumentedTypeStructureImpl(
  LiteralTypeStructureImpl.get("Pick"), [
    LiteralTypeStructureImpl.get("[]"),
    new UnionTypeStructureImpl([
      new PrefixOperatorsTypeStructureImpl(
        ["keyof", "readonly"],
        new TupleTypeStructureImpl([]), // same thing as "[]"
      ),
      StringTypeStructureImpl.get("sort")
    ])
  ]
);

myClass.getMethodOrThrow("foo").setReturnType(returnType.writerFunction);
```

You can use `parseLiteralType()`:

```typescript
myClass.getMethodOrThrow("foo").setReturnType(
  parseLiteralType(`Pick<[], keyof readonly [] | "sort">`).writerFunction
);
```

Or you could set the type directly as ts-morph allows:

```typescript
myClass.getMethodOrThrow("foo").setReturnType(`Pick<[], keyof readonly [] | "sort">`);
```

The first option is cumbersome in a direct case like this.  It's more useful when you want to modify the composite type along the way.

## Where this project really shines

- Preparing a big batch of changes as objects, to feed to ts-morph in one atomic operation.
- As the structure classes have types, they guide you in building out your structures.
- Manipulating types as objects.
- Adding nodes as structures _to an existing file_.
- Transformations.  Functions, meet input and give me some output.
- Helper tools in `ClassMembersMap`, `TypeMembersMap`, `MemberedTypeToClass`, `ImportManager` and `ExportManager`.
- Iterating over type structure objects. (`forEachAugmentedStructureChild`)
- Documentation.  (I hope!)

## Where this project doesn't help much

- Writing source code from scratch.
  - ts-morph isn't that good a tool for this either.  If you're building original source code without existing code to start from, just write it yourself.
- Trivial manipulations of a source file.
  - It takes very little effort to [change a class's implements array](https://ts-morph.com/details/classes#implements-expressions) in ts-morph.  Actually implementing what the class says it implements is much harder, and the structure classes are more useful.
- Building statements as structures.
  - Yes, I know people want statement structures.  I personally think they would be _very_ useful... as a _later_ improvement to this project.  If you're interested in building out a set of statement structure classes, I would welcome code contributions, and I have some initial design thoughts.
