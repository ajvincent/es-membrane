export const NotImplementedSet = new Set<CallableFunction>;

export function voidMethodDecorator(
  method: CallableFunction,
  context: ClassMethodDecoratorContext
): void
{
  void (method);
  void (context);
}

export function NotImplementedMethodDecorator(
  method: CallableFunction,
  context: ClassMethodDecoratorContext
): void
{
  NotImplementedSet.add(method);
  void(context);
}

export function noReferenceChangesToThis(
  method: CallableFunction,
  context: ClassMethodDecoratorContext
): void
{
  voidMethodDecorator(method, context);
}

export function defineReference(
  jointOwners: (readonly [string]) | (readonly [string, string]),
  argumentName: string,
  isStrongReference: boolean
): typeof voidMethodDecorator
{
  void(jointOwners);
  void(argumentName);
  void(isStrongReference);
  return NotImplementedMethodDecorator;
}

export function clearReferenceIfExists(
  jointOwners: (readonly [string]) | (readonly [string, string])
): typeof voidMethodDecorator
{
  void(jointOwners);
  return NotImplementedMethodDecorator;
}

export function clearObjectSlotIfExists(
  property: string,
  slotName: string
): typeof voidMethodDecorator
{
  void(property);
  void(slotName);
  return NotImplementedMethodDecorator;
}

export function flushReferences(
  fieldName: string
): typeof voidMethodDecorator
{
  void(fieldName);
  return NotImplementedMethodDecorator;
}

export function returnsConstructed(
  internalClassName: string,
  constructorArguments: readonly string[]
): typeof voidMethodDecorator
{
  void(internalClassName)
  void(constructorArguments);
  return NotImplementedMethodDecorator;
}
