const CodeMirrorManager = {
  // see below, private
  mockOptionsText: null,
  runMembraneTestText: null,

  setInitialState: function()
  {
    {
      this.mockOptionsEditor = CodeMirror.fromTextArea(
        this.mockOptionsText,
        {
          name: "javascript",
          lineNumbers: true,
          foldGutter: true,
          gutters: [
            "CodeMirror-linenumbers",
            "CodeMirror-foldgutter"
          ],
        }
      );
      this.mockOptionsEditor.setSize(600, 300);
    }

    {
      this.runMembraneTestEditor = CodeMirror.fromTextArea(
        this.runMembraneTestText,
        {
          name: "javascript",
          lineNumbers: true,
          foldGutter: true,
          gutters: [
            "CodeMirror-linenumbers",
            "CodeMirror-foldgutter"
          ],
        }
      );
      this.runMembraneTestEditor.setSize(600, 300);
    }
  },

  defineTestsArgList: function(argList)
  {
    const line = `function defineTests(${argList.join(", ")})`;
    // the editor's line 0 is rendered as line #1.
    const startPos = { line: 0, ch: 0}, endPos = { line: 0, ch: Infinity };
    this.runMembraneTestEditor.replaceRange(line, startPos, endPos);
  }
};

{
  Reflect.defineProperty(CodeMirrorManager, "lockSymbol", {
    value: Symbol("graphNames"),
    writable: false,
    enumerable: false,
    configurable: false
  });

  defineElementGetter(CodeMirrorManager, "mockOptionsText",     "CM-mockOptions");
  defineElementGetter(CodeMirrorManager, "runMembraneTestText", "CM-runMembraneTest");
}
