import {
  buildVFSFromMap
} from "#utilities/source/buildVFSFromMap.js";

it("buildVFSFromMap produces an usable file system", async () => {
  const [vfs] = await buildVFSFromMap(new Map([
    ["/source/helloWorld.txt", "hello world"],
    ["/source/data.json", JSON.stringify({
      isJSON: true
    })],
  ]));

  await expectAsync(
    vfs.promises.readFile("/source/helloWorld.txt", { encoding: "utf-8" })
  ).toBeResolvedTo("hello world");
});
