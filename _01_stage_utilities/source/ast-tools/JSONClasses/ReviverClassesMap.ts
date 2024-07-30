import assert from "node:assert/strict";

import type {
  Class
} from "type-fest";

const internalReviverMap = new Map<string, Class<JSONRevivedType<string>, []>>;

export abstract class JSONRevivedType<ClassType extends string> {
  abstract readonly jsonType: ClassType;
  abstract adoptFromJSON(other: JSONRevivedType<ClassType>): this;
}

export function registerJSONTypeClasses(
  ...classesToRegister: readonly Class<JSONRevivedType<string>>[]
): void
{
  for (const classToRegister of classesToRegister) {
    const instance = new classToRegister;
    assert.equal(
      internalReviverMap.has(instance.jsonType),
      false,
      "mustn't find class " + instance.jsonType
    );
    internalReviverMap.set(instance.jsonType, classToRegister);
  }
}

export const ReviverClassesMap: ReadonlyMap<string, Class<JSONRevivedType<string>, []>> = internalReviverMap;
