import {
  builtinLocation
} from "../builtin-classes.js";

import {
  IdentifierOwners,
  IdentifierReference,
  HOLD_TYPE,
} from "../IdentifierOwners.js";

import {
  SourceClassReferences,
  SourceClassConstructor,
  SourceClassMethod,
} from "../SourceClass.js";

export default function defineWeakRef(
  map: Map<string, SourceClassReferences>
): void
{
  const sourceClass = new SourceClassReferences;
  map.set("WeakRef", sourceClass);
  sourceClass.fileLocation = builtinLocation;

  // constructor
  {
    const ctor = new SourceClassConstructor;
    sourceClass.ctor = ctor;

    const valueParam = new IdentifierOwners;
    ctor.variables["value"] = valueParam;
    valueParam.argIndex = 0;

    // this holds value weakly
    const ref = new IdentifierReference;
    ref.identifierSequence.push("this");
    ref.holdType = HOLD_TYPE.Weak;
    valueParam.references.push(ref);
  }

  // deref
  {
    const derefMethod = new SourceClassMethod;
    sourceClass.methods["deref"] = derefMethod;
  }
}
