import cleanGenerated from "./cleanSourceGenerated.mjs";
import structureToSyntax from "./structureToSyntax.mjs";

export default async function(): Promise<void>
{
  // this has to happen first
  await cleanGenerated();

  await Promise.all([
    structureToSyntax(),
  ]);
}
