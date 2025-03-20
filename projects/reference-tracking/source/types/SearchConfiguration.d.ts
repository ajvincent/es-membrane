export interface SearchConfiguration {
  /**
   * Callback for when a searchReferences() call has an unexpected internal error.
   */
  internalErrorTrap?: () => void;

  /**
   * True if we should exclude values available to functions (this, super, arguments).
   * Usually you do not want this, but for internal development purposes (reducing noise
   * in reference-tracking testcases) this can be very helpful.
   */
  noFunctionEnvironment?: boolean;
}
