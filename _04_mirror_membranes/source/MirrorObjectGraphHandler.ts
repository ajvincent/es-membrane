import ObjectGraphTailHandler from "#objectgraph_handlers/source/generated/ObjectGraphTailHandler.js";
import RevokedInFlight from "#objectgraph_handlers/source/generated/decorators/revokedInFlight.js";
import WrapReturnValues from "#objectgraph_handlers/source/generated/decorators/wrapReturnValues.js";
import UpdateShadowTarget from "#objectgraph_handlers/source/decorators/updateShadowTarget.js";

@RevokedInFlight
@UpdateShadowTarget
@WrapReturnValues
export default
class MirrorObjectGraphHandler extends ObjectGraphTailHandler {
  // this class definition empty on purpose
}
