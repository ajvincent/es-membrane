import type { ArrayTypeStructureImpl } from "./ArrayTypeStructureImpl.js";
import type { ConditionalTypeStructureImpl } from "./ConditionalTypeStructureImpl.js";
import type { FunctionTypeStructureImpl } from "./FunctionTypeStructureImpl.js";
import type { ImportTypeStructureImpl } from "./ImportTypeStructureImpl.js";
import type { IndexedAccessTypeStructureImpl } from "./IndexedAccessTypeStructureImpl.js";
import type { InferTypeStructureImpl } from "./InferTypeStructureImpl.js";
import type { IntersectionTypeStructureImpl } from "./IntersectionTypeStructureImpl.js";
import type { LiteralTypeStructureImpl } from "./LiteralTypeStructureImpl.js";
import type { MappedTypeStructureImpl } from "./MappedTypeStructureImpl.js";
import type { MemberedObjectTypeStructureImpl } from "./MemberedObjectTypeStructureImpl.js";
import type { NumberTypeStructureImpl } from "./NumberTypeStructureImpl.js";
import type { ParameterTypeStructureImpl } from "./ParameterTypeStructureImpl.js";
import type { ParenthesesTypeStructureImpl } from "./ParenthesesTypeStructureImpl.js";
import type { PrefixOperatorsTypeStructureImpl } from "./PrefixOperatorsTypeStructureImpl.js";
import type { QualifiedNameTypeStructureImpl } from "./QualifiedNameTypeStructureImpl.js";
import type { StringTypeStructureImpl } from "./StringTypeStructureImpl.js";
import type { TemplateLiteralTypeStructureImpl } from "./TemplateLiteralTypeStructureImpl.js";
import type { TupleTypeStructureImpl } from "./TupleTypeStructureImpl.js";
import type { TypeArgumentedTypeStructureImpl } from "./TypeArgumentedTypeStructureImpl.js";
import type { TypePredicateTypeStructureImpl } from "./TypePredicateTypeStructureImpl.js";
import type { UnionTypeStructureImpl } from "./UnionTypeStructureImpl.js";
import type { WriterTypeStructureImpl } from "./WriterTypeStructureImpl.js";

export type TypeStructures = (
  ArrayTypeStructureImpl |
  ConditionalTypeStructureImpl |
  FunctionTypeStructureImpl |
  ImportTypeStructureImpl |
  IndexedAccessTypeStructureImpl |
  InferTypeStructureImpl |
  IntersectionTypeStructureImpl |
  LiteralTypeStructureImpl |
  MappedTypeStructureImpl |
  MemberedObjectTypeStructureImpl |
  NumberTypeStructureImpl |
  ParameterTypeStructureImpl |
  ParenthesesTypeStructureImpl |
  PrefixOperatorsTypeStructureImpl |
  QualifiedNameTypeStructureImpl |
  StringTypeStructureImpl |
  TemplateLiteralTypeStructureImpl |
  TupleTypeStructureImpl |
  TypeArgumentedTypeStructureImpl |
  TypePredicateTypeStructureImpl |
  UnionTypeStructureImpl |
  WriterTypeStructureImpl
);

export type TypeStructuresOrNull = TypeStructures | null;
