import buildStubs from "./buildStubs.mjs";

export default async function runModule(): Promise<void> {
  await buildStubs();
}
