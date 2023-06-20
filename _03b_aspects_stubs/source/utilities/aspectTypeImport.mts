import AspectsStubBase from "../AspectsStubBase.mjs";

export default function addAspectTypeImport(
  stubGenerator: AspectsStubBase,
  typeFile: string,
  typeToImport: string
) : void
{
  stubGenerator.addImport(
    "#aspects/stubs/source/types/" + typeFile,
    `type ${typeToImport}`,
    false
  );
}
