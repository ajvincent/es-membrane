import {
  JSDocImpl,
  JSDocTagImpl
} from "#stage_one/snapshot/source/exports.js";

const InternalJSDocTag = new JSDocImpl;
InternalJSDocTag.tags.push(new JSDocTagImpl("internal"));

export default InternalJSDocTag;
