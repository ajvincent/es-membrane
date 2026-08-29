/**
 * @this  {NodeFilter}
 * @author  Alexander J. Vincent <ajvincent@gmail.com>
 */
export class ElementFilter {
  /** @type {ReadonlySet<string>} */
  #acceptedNames;

  /**
   * @param acceptedNames {ReadonlySet<string>} - the element names to accept
   */
  constructor(acceptedNames) {
    this.#acceptedNames = new Set(acceptedNames);
  }

  /**
   * @param node {Node} - the node under test
   * @returns {1 | 3} the `NodeFilter` code
   * @public
   */
  acceptNode(node) {
    if (node instanceof Element && this.#acceptedNames.has(node.nodeName))
      return NodeFilter.FILTER_ACCEPT;
    return NodeFilter.FILTER_SKIP;
  }
}
