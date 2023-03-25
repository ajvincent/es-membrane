import { ObjectGraphStub } from "../source/ObjectGraphStub.mjs";
import SpyBase from "../../_01_stage_utilities/source/SpyBase.mjs";
import SpyProxyHandler from "./SpyProxyHandler.mjs";

export default class SpyObjectGraph
extends SpyBase implements ObjectGraphStub
{
  readonly nextHandler = new SpyProxyHandler;

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

  getNextTargetForShadow(shadowTarget: object): object
  {
    return this.getSpy("getNextTargetForShadow")(shadowTarget) as object;
  }

  getHandlerForTarget(target: object): Required<ProxyHandler<object>>
  {
    return this.getSpy("getHandlerForTarget")(target) as Required<ProxyHandler<object>>;
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
