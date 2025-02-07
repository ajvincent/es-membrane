import type {
  Class
} from "type-fest";

import type {
  ReferenceDefinitions
} from "./ReferenceDefinitions.js";;

export function VoidClassDecorator(
  _class: Class<ReferenceDefinitions>,
  context: ClassDecoratorContext
): void
{
  void(_class);
  void(context);
}

export function NotImplementedClassDecorator(
  _class: Class<ReferenceDefinitions>,
  context: ClassDecoratorContext
): void
{
  void(_class);
  void(context);
}

export function defineKeyedSlot(
  slotName: string,
  holdsKeyStrongly: boolean,
  fromConstructorArg?: string
): typeof VoidClassDecorator
{
  return function(
    _class: Class<ReferenceDefinitions>,
    context: ClassDecoratorContext
  ): Class<ReferenceDefinitions>
  {
    void(context);
    return class extends _class {
      constructor() {
        super();
        this.defineKeyedSlot(slotName, holdsKeyStrongly, fromConstructorArg);
      }
    }
  }
}

export function defineValueSlot(
  slotName: string,
  fromConstructorArg?: string
): typeof VoidClassDecorator
{
  return function(
    _class: Class<ReferenceDefinitions>,
    context: ClassDecoratorContext
  ): Class<ReferenceDefinitions>
  {
    void(context);
    return class extends _class {
      constructor() {
        super();
        this.defineValueSlot(slotName, fromConstructorArg);
      }
    }
  }
}
