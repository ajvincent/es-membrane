import url from 'node:url'
import { register } from 'node:module';

const __filename = url.fileURLToPath(import.meta.url);
register(`./subpath-imports-resolve.js`, url.pathToFileURL(__filename));
