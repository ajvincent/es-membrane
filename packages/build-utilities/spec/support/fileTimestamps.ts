import fs from "node:fs/promises";
import path from "node:path";

export const DESTINATION_DATE = new Date('2024-08-22T20:35:36.775Z');
export const SOURCE_DATE = new Date('2024-09-01T20:35:36.775Z');
export const CURRENT_DATE = new Date('2024-09-15T20:35:36.775Z');

const DESTINATION_MS_SINCE_EPOCH = Number(DESTINATION_DATE);

export async function updateTimestampsInDir(
  dir: string,
  date: Date
): Promise<void>
{
  const files = await fs.readdir(dir, { recursive: true });
  await Promise.all(files.map(async file => {
    file = path.join(dir, file);
    await fs.utimes(file, date, date);
  }));
}

export async function expectDestAccessAndModifiedDates(
  pathToFile: string,
  atime: Date,
  isNewFile: boolean,
): Promise<void>
{
  const fileStats = await fs.stat(pathToFile);

  if (isNewFile) {
    expect(fileStats.atimeMs).withContext("atime").toBeGreaterThan(Number(atime));
    expect(fileStats.mtimeMs).withContext("mtime").toBeGreaterThan(DESTINATION_MS_SINCE_EPOCH);
  }
  else {
    expect(fileStats.atimeMs).withContext("atime").toBe(Number(atime));
    expect(fileStats.mtimeMs).withContext("mtime").toBe(DESTINATION_MS_SINCE_EPOCH);
  }
}
