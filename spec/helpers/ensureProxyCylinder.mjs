/**
 * Ensure a value has been wrapped in the membrane (and is available for distortions)
 *
 * @param target {Object} The value to wrap.
 *
 * @package
 *
 * @note handler function is only for spec/properties, spec/useCases.
 */
export default function ensureProxyCylinder(handler, target) {
  if (!handler.membrane.hasProxyForValue(handler.graphName, target))
    handler.membrane.addPartsToCylinder(handler, target);
}
