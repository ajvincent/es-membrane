import path from "path";
import url from "url";
export default path.normalize(path.join(
  url.fileURLToPath(import.meta.url), "../../.."
));
