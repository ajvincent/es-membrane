// #region preamble

import type {
  RightExtendsLeft
} from "#stage_utilities/source/types/Utility.mjs";

import type {
  StaticAndInstance
} from "#stage_utilities/source/types/StaticAndInstance.mjs";

import type {
  ConfigureStubDecorator
} from "#stub_classes/source/base/types/ConfigureStubDecorator.mjs";

import type {
  TS_Method, TS_Parameter
} from "#stub_classes/source/base/types/export-types.mjs";

import type {
  ExtendsAndImplements
} from "#stub_classes/source/base/ConfigureStub.mjs";

import addBaseTypeImport from "#stub_classes/source/base/utilities/addBaseTypeImport.mjs";
import serializeParameter from "#stub_classes/source/base/utilities/serializeParameter.mjs";

// #endregion preamble

export type PrependArgumentsFields = RightExtendsLeft<StaticAndInstance, {
  staticFields: object,
  instanceFields: object,
}>;

/**
 * @internal - this is untested code!
 */
const PrependArgumentsDecorator: ConfigureStubDecorator<
  PrependArgumentsFields, [...parameters: TS_Parameter[]]
> = function(this: void, ...parameters: TS_Parameter[])
{
  return function(this: void, baseClass)
  {
    const PREPEND_ARGUMENTS = Symbol("prepend arguments");

    return class extends baseClass {
      #isOwner = false;

      protected getExtendsAndImplementsTrap(
        context: Map<symbol, unknown>
      ): ExtendsAndImplements
      {
        const foundPrependArguments = context.has(PREPEND_ARGUMENTS);
        if (!foundPrependArguments) {
          context.set(PREPEND_ARGUMENTS, []);
          this.#isOwner = true;
        }

        const _extendsAndImplements = super.getExtendsAndImplementsTrap(context);

        const prependedArgs = context.get(PREPEND_ARGUMENTS) as TS_Parameter[];
        prependedArgs.unshift(...parameters);

        if (!foundPrependArguments)
          return _extendsAndImplements;

        const prepended = prependedArgs.map(serializeParameter).join(", ");

        return {
          extends: _extendsAndImplements.extends,
          implements: _extendsAndImplements.implements.map(
            _implements => `MethodsPrependArguments<${_implements}, [${prepended}]>`
          ),
        };
      }

      protected methodTrap(
        methodStructure: TS_Method | null,
        isBefore: boolean,
      ) : void
      {
        super.methodTrap(methodStructure, isBefore);

        if (!isBefore)
          return;

        if (!methodStructure) {
          addBaseTypeImport(
            this, "MethodsPrependArguments.mjs", "MethodsPrependArguments"
          );
          return;
        }

        methodStructure.parameters ||= [];
        methodStructure.parameters.unshift(...parameters);
      }
    }
  }
}

export default PrependArgumentsDecorator;
