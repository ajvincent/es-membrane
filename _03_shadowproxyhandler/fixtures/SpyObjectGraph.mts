import { ObjectGraphStub } from "../source/ObjectGraphStub.mjs";
import SpyBase from "./SpyBase.mjs";
import SpyProxyHandler from "./SpyProxyHandler.mjs";

export default class SpyObjectGraph<T extends object>
extends SpyBase implements ObjectGraphStub<T>
{
  readonly nextHandler: SpyProxyHandler<T> = new SpyProxyHandler;

  constructor()
  {
    super();
    [
      "getNextTargetForShadow",
      "getHandlerForTarget",
      "convertArguments",
      "convertDescriptor",
    ].forEach(key => this.getSpy(key));

    this.getSpy("getHandlerForTarget").and.returnValue(this.nextHandler);
  }

  expectSpiesClearExcept(...names: (string | symbol)[]) : void
  {
    super.expectSpiesClearExcept(...names);
    expect(Array.from(this.spyMap.keys())).toEqual([
      "getNextTargetForShadow",
      "getHandlerForTarget",
      "convertArguments",
      "convertDescriptor",
    ]);
  }

  getNextTargetForShadow(shadowTarget: T): T
  {
    return this.getSpy("getNextTargetForShadow")(shadowTarget) as T;
  }

  getHandlerForTarget(target: T): Required<ProxyHandler<T>>
  {
    return this.getSpy("getHandlerForTarget")(target) as Required<ProxyHandler<T>>;
  }

  convertArguments(...args: unknown[]): unknown[]
  {
    return this.getSpy("convertArguments")(...args) as unknown[];
  }

  convertDescriptor(descriptor: PropertyDescriptor): PropertyDescriptor
  {
    return this.getSpy("convertDescriptor")(descriptor) as PropertyDescriptor;
  }
}
