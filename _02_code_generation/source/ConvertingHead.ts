/* this generates a Required<ProxyHandler<object>> class which:
(1) owns a reference to MembraneIfc, and a reference to a ShadowProxyHandler
(2) calls methods of MembraneIfc to convert target, arguments and descriptors
(3) calls methods of MembraneIfc to get the next ProxyHandler, or Reflect
(4) forwards to the same trap on the ShadowProxyHandler
(5) takes the response and wraps it for returning

Requirements:

- #membraneIfc: MembraneIfc;
- #graphHandler: ObjectGraphHandler;
- protected abstract getValueInGraph(value: object): object;
- protected abstract getDescriptorInGraph(desc: PropertyDescriptor): object;
*/
