import ObjectGraphTailHandler from "#objectgraph_handlers/source/generated/ObjectGraphTailHandler.js";
import InheritedPropertyTraps from "#objectgraph_handlers/source/decorators/inheritedProperties.js";
import RevokedInFlight from "#objectgraph_handlers/source/generated/decorators/revokedInFlight.js";
import UpdateShadowTarget from "#objectgraph_handlers/source/decorators/updateShadowTarget.js";
import WrapReturnValues from "#objectgraph_handlers/source/generated/decorators/wrapReturnValues.js";

@RevokedInFlight
@InheritedPropertyTraps
@UpdateShadowTarget
@WrapReturnValues
export default
class MirrorObjectGraphHandler extends ObjectGraphTailHandler {
  // this class definition empty on purpose
}
