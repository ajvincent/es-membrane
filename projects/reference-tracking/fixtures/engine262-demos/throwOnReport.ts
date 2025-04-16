function zero(): void {
  // @ts-expect-error deliberately calling with an invalid report argument to see how it reacts.
  report(0);
}

function one(): void {
  zero();
}

function two(): void {
  one();
}

function three(): void {
  two();
}

three();
