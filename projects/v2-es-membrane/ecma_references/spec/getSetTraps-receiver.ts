describe("Receivers in Reflect", function() {
  let alpha: {
    upper: object,
    _hidden: object,
    value: string,
  };
  let beta: {
    _hidden: object,
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
        return this._hidden;
      },
      set upper(val) {
        this._hidden = val;
      },
      _hidden: ALPHA,
      value: "a",
    };

    beta = {
      _hidden: BETA,
      value: "b"
    };
  });

  it("are where property lookups happen", function() {
    expect(Reflect.get(alpha, "upper", beta)).toBe(BETA);
  });

  it("are where property setter invocations happen", function() {
    const X = { isX: true };
    Reflect.set(alpha, "upper", X, beta);
    expect(beta._hidden).toBe(X);
    expect(alpha._hidden).toBe(ALPHA);
  });
});
