import BaseStub from "../../base/ConfigureStub.mjs"

export default function addTransitionTypeImport(
  stubGenerator: BaseStub,
  typeFile: string,
  typeToImport: string
) : void
{
  stubGenerator.addImport(
    "#stub_classes/source/transitions/types/" + typeFile,
    `type ${typeToImport}`,
    false
  );
}
