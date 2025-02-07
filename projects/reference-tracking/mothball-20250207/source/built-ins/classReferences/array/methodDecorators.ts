import type {
  CallableMethodsOfArray,
} from "../../../types/CallableMethodsOfArray.js";

import {
  NotImplementedSet,
  noReferenceChangesToThis,
  voidMethodDecorator,
} from "../methodDecorators.js";

function NotImplementedDecorator(
  method: CallableFunction,
  context: ClassMethodDecoratorContext
): void
{
  NotImplementedSet.add(method);
  void(context);
}

function createCloneAndUseForRefs(
  method: CallableFunction,
  context: ClassMethodDecoratorContext
): void
{
  NotImplementedDecorator(method, context);
}

function callArrayReferenceMethod<T extends keyof CallableMethodsOfArray> (
  methodName: T
): typeof voidMethodDecorator
{
  void(methodName);
  return NotImplementedDecorator;
}

function unresolvable(
  method: CallableFunction,
  context: ClassMethodDecoratorContext
): void
{
  NotImplementedDecorator(method, context);
}

function arrayOrderingLost(
  method: CallableFunction,
  context: ClassMethodDecoratorContext
): void
{
  NotImplementedDecorator(method, context);
}

export {
  arrayOrderingLost,
  callArrayReferenceMethod,
  createCloneAndUseForRefs,
  noReferenceChangesToThis,
  unresolvable,
}
