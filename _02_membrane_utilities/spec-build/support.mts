import { buildAspectClassRaw } from "../source/AspectDecorators.mjs";

export default async function runModule() : Promise<void>
{
  await buildAspectClassRaw(
    {
      exportName: "NumberStringType",
      importMeta: import.meta,
      pathToDirectory: "../../fixtures",
      leafName: "NumberStringType.mjs"
    },
    {
      exportName: "NumberStringClass",
      importMeta: import.meta,
      pathToDirectory: "../../fixtures",
      leafName: "NumberStringClass.mjs"
    },
    {
      "repeatForward": [
        ["s", "string"],
        ["n", "number"],
      ],

      "repeatBack": [
        ["n", "number"],
        ["s", "string"],
      ],
    },
    {
      importMeta: import.meta,
      pathToDirectory: "../../fixtures/aspects"
    },
    {
      classInvariant: ["Spy", "Spy"]
    },
    {
      exportName: "NumberStringAspectClass",
      importMeta: import.meta,
      pathToDirectory: "../../spec-generated",
      leafName: "NumberStringAspectClass.mts"
    }
  );
}
