import ObjectGraphTailHandler from "#objectgraph_handlers/source/generated/ObjectGraphTailHandler.js";
import WrapReturnValues from "#objectgraph_handlers/source/generated/decorators/wrapReturnValues.js";
import UpdateShadowTarget from "#objectgraph_handlers/source/decorators/updateShadowTarget.js";

@UpdateShadowTarget
@WrapReturnValues
export default
class MirrorObjectGraphHandler extends ObjectGraphTailHandler {

}
