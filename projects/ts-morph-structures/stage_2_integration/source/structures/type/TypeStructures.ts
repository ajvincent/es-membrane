import ArrayTypeStructureImpl from "./ArrayTypeStructureImpl.js";
import ConditionalTypeStructureImpl from "./ConditionalTypeStructureImpl.js";
import FunctionTypeStructureImpl from "./FunctionTypeStructureImpl.js";
import ImportTypeStructureImpl from "./ImportTypeStructureImpl.js";
import IndexedAccessTypeStructureImpl from "./IndexedAccessTypeStructureImpl.js";
import InferTypeStructureImpl from "./InferTypeStructureImpl.js";
import IntersectionTypeStructureImpl from "./IntersectionTypeStructureImpl.js";
import LiteralTypeStructureImpl from "./LiteralTypeStructureImpl.js";
import MappedTypeStructureImpl from "./MappedTypeStructureImpl.js";
import MemberedObjectTypeStructureImpl from "./MemberedObjectTypeStructureImpl.js";
import NumberTypeStructureImpl from "./NumberTypeStructureImpl.js";
import ParameterTypeStructureImpl from "./ParameterTypeStructureImpl.js";
import ParenthesesTypeStructureImpl from "./ParenthesesTypeStructureImpl.js";
import PrefixOperatorsTypeStructureImpl from "./PrefixOperatorsTypeStructureImpl.js";
import QualifiedNameTypeStructureImpl from "./QualifiedNameTypeStructureImpl.js";
import StringTypeStructureImpl from "./StringTypeStructureImpl.js";
import TemplateLiteralTypeStructureImpl from "./TemplateLiteralTypeStructureImpl.js";
import TupleTypeStructureImpl from "./TupleTypeStructureImpl.js";
import TypeArgumentedTypeStructureImpl from "./TypeArgumentedTypeStructureImpl.js";
import TypePredicateTypeStructureImpl from "./TypePredicateTypeStructureImpl.js";
import UnionTypeStructureImpl from "./UnionTypeStructureImpl.js";
import WriterTypeStructureImpl from "./WriterTypeStructureImpl.js";

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
