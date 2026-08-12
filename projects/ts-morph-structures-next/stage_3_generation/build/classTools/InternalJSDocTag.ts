import {
  JSDocImpl,
  JSDocTagImpl
} from "#stage_two/snapshot/source/exports.js";

const InternalJSDocTag = new JSDocImpl;
InternalJSDocTag.tags.push(new JSDocTagImpl("internal"));

export default InternalJSDocTag;
