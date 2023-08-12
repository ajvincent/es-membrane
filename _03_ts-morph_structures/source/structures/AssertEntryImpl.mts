import {
  AssertEntryStructure,
  OptionalKind,
  StructureKind,
} from "ts-morph";
import { CloneableStructure } from "../types/CloneableStructure.mjs";
import StructureBase from "../decorators/StructureBase.mjs";
import StructuresClassesMap from "../base/StructuresClassesMap.mjs";


export default class AssertEntryImpl
extends StructureBase
implements AssertEntryStructure
{
  readonly kind: StructureKind.AssertEntry = StructureKind.AssertEntry;
  name: string;
  value: string;

  constructor(
    name: string,
    value: string
  )
  {
    super();
    this.name = name;
    this.value = value;
  }

  public static clone(
    other: OptionalKind<AssertEntryStructure>
  ): AssertEntryImpl
  {
    const clone = new AssertEntryImpl(other.name, other.value);
    StructureBase.cloneTrivia(other, clone);
    return clone;
  }
}
AssertEntryImpl satisfies CloneableStructure<AssertEntryStructure>;

StructuresClassesMap.set(StructureKind.AssertEntry, AssertEntryImpl);
