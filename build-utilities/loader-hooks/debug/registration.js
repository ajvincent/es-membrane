import url from 'node:url'
import { register } from 'node:module';

const { searchParams } = new url.URL(import.meta.url);

const __filename = url.fileURLToPath(import.meta.url);
register(`./loader.js?${searchParams.toString()}`, url.pathToFileURL(__filename));
