export interface IndexSignatureWithMethod {
  [key: string]: (n: number) => string;
  hello(n: number): "hello";
}
