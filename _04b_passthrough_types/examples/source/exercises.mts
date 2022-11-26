import NumberStringClass from "../generated/EntryClass.mjs";

import ForwardingSpy from "./ForwardingSpy.mjs";
import ComponentMap from "../generated/PassThroughClassType.mjs";
import type { ComponentMapOverride } from "../generated/KeyToComponentMap_Base.mjs";
import type { NumberStringType } from "../build/NumberStringType.mjs";

// straight-forward use
{
  const target = new NumberStringClass;

  console.log(`repeatForward('foo', 3) = ${target.repeatForward('foo', 3)}`);
  console.log(`repeatBack('bar', 3) = ${target.repeatForward('bar', 3)}`);
}

// Placing a Jasmine spy around the target's main body.
{
  const target = new NumberStringClass;

  const mainBody = ComponentMap.getComponent(target, "MainBody");
  const spy = new ForwardingSpy(mainBody);

  const overrideConfig: ComponentMapOverride<NumberStringType, NumberStringType> = {
    components: new Map([
      ["MainBody", spy]
    ]),
    sequences: new Map([]),
    startComponent: ComponentMap.defaultStart as string,
  };
  ComponentMap.override(target, overrideConfig);

  console.log("With inserted spy:")
  console.log(`  repeatForward('foo', 3) = ${target.repeatForward('foo', 3)}`);
  console.log(`  repeatBack(3, 'bar') = ${target.repeatBack(3, 'bar')}`);

  console.log(`  calls: ${JSON.stringify(spy.calls, null, 2)}`);
}
