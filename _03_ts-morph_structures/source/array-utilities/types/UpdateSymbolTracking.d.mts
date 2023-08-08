export interface UpdateSymbolTracking {
  markUpdated(): symbol;
  get lastUpdateSymbol(): symbol;
}
