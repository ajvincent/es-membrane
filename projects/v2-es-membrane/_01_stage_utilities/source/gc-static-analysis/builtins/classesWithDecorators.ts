import type {
  Class
} from "type-fest";

//#region metadata decorators
function voidMethodDecorator(
  method: any,
  context: ClassMethodDecoratorContext
): void
{
  void (method);
  void (context);
}

function holdsReference(
  owningIdentifier: string,
  parameterName: string,
  isStrongReference: boolean
): typeof voidMethodDecorator
{
  void (isStrongReference);
  void (parameterName)
  void (owningIdentifier);
  return voidMethodDecorator;
}

function clearsReference(
  parameterName: string
): typeof voidMethodDecorator
{
  void parameterName;
  return voidMethodDecorator;
}

function voidClassDecorator(
  baseClass: Class<object>,
  context: ClassDecoratorContext
): void
{
  void(baseClass);
  void(context);
}

function ctorHoldsReference(
  parameterName: string,
  isStrongReference: boolean
): typeof voidClassDecorator
{
  void(parameterName);
  void(isStrongReference);
  return voidClassDecorator;
}

const noReferences = voidMethodDecorator;
const clearsAllReferences = voidMethodDecorator;
//#endregion metadata decorators

const BuiltInClassMap: Record<string, Class<object>> = {
  "WeakMap": class <K extends object, V> implements WeakMap<K, V> {
    @clearsReference("key")
    delete(key: K): boolean {
      void (key);
      throw new Error("Method not implemented.");
    }

    @noReferences
    get(key: K): V | undefined {
      void key;
      throw new Error("Method not implemented.");
    }

    @noReferences
    has(key: K): boolean {
      void key;
      throw new Error("Method not implemented.");
    }

    @holdsReference("this", "key", false)
    @holdsReference("key", "value", true)
    set(key: K, value: V): this {
      void key;
      void value;
      throw new Error("Method not implemented.");
    }
    [Symbol.toStringTag] = "WeakMap";
  },

  "Map": class <K, V> implements Map<K, V> {
    @clearsAllReferences
    clear(): void {
      throw new Error("Method not implemented.");
    }

    @clearsReference("key")
    delete(key: K): boolean {
      void key;
      throw new Error("Method not implemented.");
    }

    @noReferences
    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
      void callbackfn;
      void thisArg;
      throw new Error("Method not implemented.");
    }

    @noReferences
    get(key: K): V | undefined {
      void key;
      throw new Error("Method not implemented.");
    }

    @noReferences
    has(key: K): boolean {
      void key;
      throw new Error("Method not implemented.");
    }

    @holdsReference("this", "key", true)
    @holdsReference("key", "value", true)
    set(key: K, value: V): this {
      void key;
      void value;
      throw new Error("Method not implemented.");
    }

    size: number = 0;

    @noReferences
    entries(): MapIterator<[K, V]> {
      throw new Error("Method not implemented.");
    }

    @noReferences
    keys(): MapIterator<K> {
      throw new Error("Method not implemented.");
    }

    @noReferences
    values(): MapIterator<V> {
      throw new Error("Method not implemented.");
    }

    @noReferences
    [Symbol.iterator](): MapIterator<[K, V]> {
      throw new Error("Method not implemented.");
    }

    [Symbol.toStringTag] = "Map";
  },

  "WeakRef":
  @ctorHoldsReference("value", false)
  class<T extends object> implements WeakRef<T> {
    @noReferences
    deref(): T | undefined {
      throw new Error("Method not implemented.");
    }

    [Symbol.toStringTag]: "WeakRef" = "WeakRef"
  }
}

export default BuiltInClassMap;
