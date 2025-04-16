const results = {
  _null: echoNull(),
  _false: echoNegate(true),
  three: echoPlusOne(2),
  string_: echoAppendUnderscore("my string"),
  Five: echoMinusOne(BigInt(6)),
};

report([{results}]);
