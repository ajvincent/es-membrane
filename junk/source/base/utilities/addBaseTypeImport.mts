import BaseStub from "../ConfigureStub.mjs";

export default function addBaseTypeImport(
  stubGenerator: BaseStub,
  typeFile: string,
  typeToImport: string
) : void
{
  stubGenerator.addImport(
    "#stub_classes/source/base/types/" + typeFile,
    `type ${typeToImport}`,
    false
  );
}
