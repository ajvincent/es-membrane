import {
  IdentifierOwners,
  IdentifierReference,
} from "./IdentifierOwners.js";

import {
  JSONRevivedType,
  registerJSONTypeClasses,
} from "./ReviverClassesMap.js" ;

export class SourceClassReferences extends JSONRevivedType<"SourceClassReferences">
{
  readonly jsonType = "SourceClassReferences";
  fileLocation: string = "";

  /** key: property name, value: class name */
  readonly properties: Record<string, SourceClassProperty> = {};
  readonly methods: Record<string, SourceClassMethod> = {};

  adoptFromJSON(
    other: SourceClassReferences
  ): this
  {
    this.fileLocation = other.fileLocation;
    for (const [key, value] of Object.entries(other.properties)) {
      this.properties[key] = value;
    }

    for (const [key, value] of Object.entries(other.methods)) {
      this.methods[key] = value;
    }

    return this;
  }
}

export class SourceClassProperty {
  readonly jsonType = "SourceClassProperty";
  adoptFromJSON(other: SourceClassProperty): this {
    return this;
  }
}

export class SourceClassMethod {
  adoptFromJSON(other: SourceClassMethod): this {
    this.parameters = other.parameters;
    this.returnValue = other.returnValue;
    return this;
  }

  readonly jsonType = "SourceClassMethod";
  parameters: IdentifierOwners[] = [];

  returnValue: IdentifierOwners;

  constructor() {
    this.returnValue = new IdentifierOwners;
    this.returnValue.argIndex = IdentifierOwners.ReturnIndex;
  }
}

registerJSONTypeClasses(
  SourceClassReferences,
  SourceClassProperty,
  SourceClassMethod,
);
