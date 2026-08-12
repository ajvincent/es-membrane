export default async function support(): Promise<void>
{
  const dist = (await import("./dist.js")).default;
  await dist();
}
