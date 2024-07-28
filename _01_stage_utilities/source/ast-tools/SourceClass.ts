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
  ctor?: SourceClassConstructor;

  /** key: property name, value: class field */
  readonly properties: Record<string, SourceClassProperty> = {};
  readonly methods: Record<string, SourceClassMethod> = {};

  adoptFromJSON(
    other: SourceClassReferences
  ): this
  {
    this.fileLocation = other.fileLocation;
    this.ctor = other.ctor;

    for (const [key, value] of Object.entries(other.properties)) {
      this.properties[key] = value;
    }

    for (const [key, value] of Object.entries(other.methods)) {
      this.methods[key] = value;
    }

    return this;
  }
}

export class SourceClassConstructor extends JSONRevivedType<"SourceClassConstructor"> {
  readonly jsonType = "SourceClassConstructor";
  adoptFromJSON(
    other: SourceClassConstructor
  ): this
  {
    this.parameters = other.parameters;
    return this;
  }

  parameters: IdentifierOwners[] = [];
}

export class SourceClassProperty extends JSONRevivedType<"SourceClassProperty"> {
  readonly jsonType = "SourceClassProperty";
  adoptFromJSON(other: SourceClassProperty): this {
    return this;
  }
}

export class SourceClassMethod extends JSONRevivedType<"SourceClassMethod"> {
  readonly jsonType = "SourceClassMethod";
  adoptFromJSON(other: SourceClassMethod): this {
    this.parameters = other.parameters;
    this.returnValue = other.returnValue;
    return this;
  }

  parameters: IdentifierOwners[] = [];
  returnValue: IdentifierOwners;

  constructor() {
    super();
    this.returnValue = new IdentifierOwners;
    this.returnValue.argIndex = IdentifierOwners.ReturnIndex;
  }
}

registerJSONTypeClasses(
  SourceClassReferences,
  SourceClassConstructor,
  SourceClassProperty,
  SourceClassMethod,
);
