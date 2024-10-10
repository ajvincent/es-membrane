describe("Receivers in Reflect", function() {
  let alpha: {
    upper: object,
    _upper: object,
    value: string,
  };
  let beta: {
    _upper: object,
    value: string,
  };
  let ALPHA: object, BETA: object;
  beforeEach(function() {
    ALPHA = {
      value: "A"
    };
    BETA  = {
      value: "B"
    };

    alpha = {
      get upper() {
        return this._upper;
      },
      set upper(val) {
        this._upper = val;
      },
      _upper: ALPHA,
      value: "a",
    };

    beta = {
      _upper: BETA,
      value: "b"
    };
  });

  it("are where property lookups happen", function() {
    expect(Reflect.get(alpha, "upper", beta)).toBe(BETA);
  });

  it("are where property setter invocations happen", function() {
    const X = { isX: true };
    Reflect.set(alpha, "upper", X, beta);
    expect(beta._upper).toBe(X);
    expect(alpha._upper).toBe(ALPHA);
  });
});
