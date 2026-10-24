// VariableDeclarationStructure
let x: number = 4;

// unknown, so a string
x += 2;

// unknown, so a string
// this is to prove that ts-morph doesn't consolidate unknown statements into one statement string
void x;

// unknown, so a string
// block statements thus obscure the mix of structures inside them.
if (x > 0) {
  const y: number = 7;
  void y;
}

// ExportDeclarationStructure
export {
  x
};
