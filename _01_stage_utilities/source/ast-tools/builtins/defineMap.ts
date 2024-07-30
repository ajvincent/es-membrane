import {
  builtinLocation,
} from "../builtin-classes.js";

import {
  IdentifierOwners,
  IdentifierReference,
  HOLD_TYPE,
} from "../JSONClasses/IdentifierOwners.js";

import {
  SourceClassReferences,
  SourceClassMethod,
} from "../JSONClasses/SourceClass.js";

export default function defineMap(
  map: Map<string, SourceClassReferences>
): void
{
  const sourceClass = new SourceClassReferences;
  sourceClass.fileLocation = builtinLocation;
  map.set("Map", sourceClass);

  // delete
  {
    const deleteOwners = new SourceClassMethod;
    sourceClass.methods["delete"] = deleteOwners;

    const keyParam = new IdentifierOwners;
    deleteOwners.variables["key"] = keyParam;

    keyParam.argIndex = 0;
  }

  // get
  {
    const getOwners = new SourceClassMethod;
    sourceClass.methods["get"] = getOwners;

    const keyParam = new IdentifierOwners;
    getOwners.variables["key"] = keyParam;

    keyParam.argIndex = 0;
  }

  // has
  {
    const hasOwners = new SourceClassMethod;
    sourceClass.methods["has"] = hasOwners;

    const keyParam = new IdentifierOwners;
    hasOwners.variables["key"] = keyParam;

    keyParam.argIndex = 0;
  }

  // set
  {
    const setOwners = new SourceClassMethod;
    sourceClass.methods["set"] = setOwners;

    const keyParam = new IdentifierOwners;
    setOwners.variables["key"] = keyParam;
    keyParam.argIndex = 0;

    const valueParam = new IdentifierOwners;
    setOwners.variables["value"] = valueParam;
    valueParam.argIndex = 1;

    // this holds key strongly
    {
      const ref = new IdentifierReference;
      ref.holdType = HOLD_TYPE.Strong;
      ref.identifierSequence.push(IdentifierOwners.ThisIdentifier);
      keyParam.references.push(ref);
    }

    // key holds value strongly
    {
      const ref = new IdentifierReference;
      ref.holdType = HOLD_TYPE.Strong;
      ref.identifierSequence.push("key");
      valueParam.references.push(ref);
    }
  }
}
