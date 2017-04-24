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
          gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        }
      );
      this.mockOptionsEditor.setSize(600, 200);
    }

    {
      this.runMembraneTestEditor = CodeMirror.fromTextArea(
        this.runMembraneTestText,
        {
          name: "javascript",
          lineNumbers: true,
          foldGutter: true,
          gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        }
      );
      this.runMembraneTestEditor.setSize(600, 300);
    }
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
