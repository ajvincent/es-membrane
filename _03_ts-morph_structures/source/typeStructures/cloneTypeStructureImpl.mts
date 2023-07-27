/**
 * We've got a circular dependency landmine here.  Nothing explicitly imports this registry file,
 * which means there's no guarantee this registry will happen.  If we import this from one of the
 * classes below, then we have our circular dependency and Bad Things happen.
 *
 * So far, I've been "lucky", as test code seems to be importing it for me.  I really need to not
 * depend on luck.
 */

import {
  TypeStructureKind
} from "./TypeStructureKind.mjs";

import ArrayTypedStructureImpl from "./ArrayTypedStructureImpl.mjs";
import FunctionTypedStructureImpl from "./FunctionTypedStructureImpl.mjs";
import IndexedAccessTypedStructureImpl from "./IndexedAccessTypedStructureImpl.mjs";
import IntersectionTypedStructureImpl from "./IntersectionTypedStructureImpl.mjs";
import KeyOfTypeofTypedStructureImpl from "./KeyofTypeofTypedStructureImpl.mjs";
import LiteralTypedStructureImpl from "./LiteralTypedStructureImpl.mjs";
import StringTypedStructureImpl from "./StringTypedStructureImpl.mjs";
import SymbolKeyTypedStructureImpl from "./SymbolKeyTypedStructureImpl.mjs";
import TupleTypedStructureImpl from "./TupleTypedStructureImpl.mjs";
import TypeArgumentedTypedStructureImpl from "./TypeArgumentedTypedStructureImpl.mjs";
import UnionTypedStructureImpl from "./UnionTypedStructureImpl.mjs";
import WriterTypedStructureImpl from "./WriterTypedStructureImpl.mjs";

import cloneableClassesMap from "./cloneableClassesMap.mjs";

cloneableClassesMap.set(TypeStructureKind.Array, ArrayTypedStructureImpl);
cloneableClassesMap.set(TypeStructureKind.Function, FunctionTypedStructureImpl);
cloneableClassesMap.set(TypeStructureKind.IndexedAccess, IndexedAccessTypedStructureImpl);
cloneableClassesMap.set(TypeStructureKind.Intersection, IntersectionTypedStructureImpl);
cloneableClassesMap.set(TypeStructureKind.KeyOfTypeof, KeyOfTypeofTypedStructureImpl);
cloneableClassesMap.set(TypeStructureKind.Literal, LiteralTypedStructureImpl);
cloneableClassesMap.set(TypeStructureKind.String, StringTypedStructureImpl);
cloneableClassesMap.set(TypeStructureKind.SymbolKey, SymbolKeyTypedStructureImpl);
cloneableClassesMap.set(TypeStructureKind.Tuple, TupleTypedStructureImpl);
cloneableClassesMap.set(TypeStructureKind.TypeArgumented, TypeArgumentedTypedStructureImpl);
cloneableClassesMap.set(TypeStructureKind.Union, UnionTypedStructureImpl);
cloneableClassesMap.set(TypeStructureKind.Writer, WriterTypedStructureImpl);

export default cloneableClassesMap;
