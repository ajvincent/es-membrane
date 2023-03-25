/** @see {@link https://github.com/dsherret/code-block-writer/issues/42#issuecomment-1483618103} */

import CBW_, {
  type Options as CodeBlockWriterOptions
} from "code-block-writer";

const CodeBlockWriter = (CBW_ as unknown as {
  default: new (opts?: Partial<CodeBlockWriterOptions>) => CBW_
}).default;

export default CodeBlockWriter;
export type {
  CodeBlockWriterOptions
};
