# Overall design for developers

## Philosophy of this design

## Decorators for existing structures

## Base utilities

### `StructureBase`

### Classes maps

### `TypeStructureKind`

## Structure classes which define everything (almost)

### What's missing?

## Type structures overview

## Mapping type strings and writer functions to type structures, and back

### `TypeWriterManager`

### Using `TypeWriterManager` in structure classes and decorators

### Type structure registry (writer functions support)

### `LiteralTypedStructureImpl` and `WriterTypedStructureImpl` special handling

### Unordered type arrays: `class implements`, `interface extends`

### `ReadonlyProxyArrayHandler`

### `TypeWriterSet`

## Bootstrapping: from `ts-morph` nodes and structures to type-augmented structures

### Structure-to-node map

### Convert one type node to a type structure

### Finding the right type nodes for a given node

### Discovering nodes with structures within type nodes

### Allowing for failures (or "this code probably doesn't cover everything")

### Driving with `getTypeAugmentedStructure()`

## What does this project export?

## The Future

### Porting to `ts-morph` upstream?

### Factory constructors and methods

### Write access to type array proxies

### More tests, please

### Checklist for adding a new structure class

### Checklist for adding a new type structure class
