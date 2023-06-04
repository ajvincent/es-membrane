import { ClassWithAspects, AspectsBuilder } from "#aspect_weaving/source/generated/AspectsDictionary.mjs";
import { ASPECTS_BUILDER } from "#aspect_weaving/source/stubs/symbol-keys.mjs";
import { ModuleSourceDirectory, getModuleDefaultClass } from "#stage_utilities/source/AsyncSpecModules.mjs";
import { NumberStringType } from "#stub_classes/fixtures/types/NumberStringType.mjs";

const generatedDir: ModuleSourceDirectory = {
  importMeta: import.meta,
  pathToDirectory: "../../../spec-generated/"
};

const NST_Aspect = (await getModuleDefaultClass<NumberStringType>(
  generatedDir, "empty/AspectDriver.mjs"
)) as ClassWithAspects<NumberStringType>;

export default
function buildAspectOverrideClass(): ClassWithAspects<NumberStringType>
{
  return class NST_Aspect_Override extends NST_Aspect {
    public static readonly [ASPECTS_BUILDER] = new AspectsBuilder<NumberStringType>(
      NST_Aspect[ASPECTS_BUILDER]
    );
    public get [ASPECTS_BUILDER](): AspectsBuilder<NumberStringType> {
      return NST_Aspect_Override[ASPECTS_BUILDER];
    }
  }
}
