# Pass-through types

## Requirements

- [x] Exports
  - [x] In a subdirectory of source
  - [x] Component classes need a pass-through argument
  - [x] Bootstrap from standard API to a component class
  - [x] Sequence of component classes
- [x] Define the map of property keys to component classes
  - [x] At build time for integration tests
  - [x] Overrideable for unit tests
  - [x] Map a set to one instance for overrides
  - [x] Special protected field (key is a symbol) for shared base class
  - [x] How to handle private, static properties?
  - [x] Needs to hold properties for shared class outside
- [x] JSON schema for configuring build projects

## Checklist

Source:

- [x] Create base "not implemented" class via TypeToClass
- [x] Key-to-component map
  - [x] `InstanceToComponentMap.defaultKeyMap`
  - [x] Pass `defaultKeyMap` into instances of the entry class
- [x] Create pass-through class type
  - [x] returns are void
  - [x] entryPoint: ThisClassType extends PublicClassType
  - [x] setReturnValue()
  - [x] getReturnType()
- [x] Extended "continue" class (returning previous results), copied from base class
- [x] Entry class ("ForwardTo_Base") copied from base class
  - Cannot add a static property for the instance-to-component map. "Static members cannot reference class type parameters. ts(2302)"
- [x] Sequence support
- [x] Extended "not implemented" class copied from base class

Spec-build:

- [x] Spy class
- [x] Add specs
  - [x] Base not implemented class
  - [x] Entry class
  - [x] Component not implemented class
  - [x] Component continue class
