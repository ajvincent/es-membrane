import { TSESTree } from "@typescript-eslint/typescript-estree";
import {
  JSONRevivedType,
  registerJSONTypeClasses
} from "./ReviverClassesMap.js";

/* example:
    this.#ownerRevokerOneToOneMap.set(owner, revoker);
    this.#ownerRevokerOneToOneMap.set(revoker, owner);
{
  jsonType: "IdentifierOwners",
  identifier: "owner",
  argIndex: 0,
  references: [
    {
      jsonType: "IdentifierReference",
      holdType: HOLD_TYPE.Weak,
      identifierSequence: ["this", "#ownerRevokerOneToOneMap"],
      location: {
        start: {
          line: 50,
          column: 38
        }
      }
    },
    {
      jsonType: "IdentifierReference",
      holdType: HOLD_TYPE.Weak,
      identifierSequence: ["this", "#ownerRevokerOneToOneMap"],
      location: {
        start: {
          line: 51,
          column: 38
        }
      }
    },
    {
      jsonType: "IdentifierReference",
      holdType: HOLD_TYPE.Conditional,
      identifierSequence: ["revoker"]
      location: {
        start: {
          line: 51,
          column: 47
        }
      }
    }
  ]
}

For calls on other methods, use a Promise to resolve them.
*/

export enum HOLD_TYPE {
  Indeterminate = "Indeterminate",
  Weak = "Weak",
  Strong = "Strong",
}

export class IdentifierReference extends JSONRevivedType<"IdentifierReference">
{
  adoptFromJSON(
    other: IdentifierReference
  ): this
  {
    this.holdType = other.holdType;
    this.identifierSequence = other.identifierSequence;
    this.location = other.location;
    this.statementLocation = other.statementLocation;

    return this;
  }

  readonly jsonType = "IdentifierReference";

  holdType: HOLD_TYPE = HOLD_TYPE.Indeterminate;
  identifierSequence: string[] = [];
  location: TSESTree.SourceLocation = {
    start: {
      line: 0,
      column: 0,
    },
    end: {
      line: 0,
      column: 0
    }
  }
  statementLocation?: TSESTree.SourceLocation;
}

/** A JSON-serializable object describing where we keep references to an identifier. */
export class IdentifierOwners extends JSONRevivedType<"IdentifierOwners" | "CallbackOwners">
{
  static readonly ThisIdentifier = "this";
  static readonly ThisIndex = -2;

  static readonly ReturnIdentifier = "(return value)";
  static readonly ReturnIndex = -1;

  readonly jsonType: "IdentifierOwners" | "CallbackOwners" = "IdentifierOwners";
  argIndex: number = NaN;

  readonly references: IdentifierReference[] = [];

  adoptFromJSON(
    other: IdentifierOwners
  ): this
  {
    this.argIndex = other.argIndex;
    this.references.push(...other.references);

    return this;
  }
}

export class CallbackIdentifierOwners extends IdentifierOwners
{
  readonly jsonType = "CallbackOwners";
  readonly thisParameter: IdentifierOwners;
  readonly parameters: IdentifierOwners[] = [];
  readonly returnValue: IdentifierOwners;

  constructor() {
    super();
    this.thisParameter = new IdentifierOwners;
    this.thisParameter.argIndex = IdentifierOwners.ThisIndex;

    this.returnValue = new IdentifierOwners;
    this.returnValue.argIndex = IdentifierOwners.ReturnIndex;
  }
}

registerJSONTypeClasses(
  CallbackIdentifierOwners,
  IdentifierReference,
  IdentifierOwners,
);
