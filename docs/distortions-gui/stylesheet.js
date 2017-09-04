"use strict";
function getCustomStylesheet(document) {
  var elem = document.createElement("style");
  document.head.appendChild(elem);
  var comment = document.createComment(
    "This stylesheet exists to hold dynamically created style rules.  " +
    "That's why this is empty.  See tree-mockup.js for details."
  );
  elem.appendChild(comment);
  return elem.sheet;
}

function CSSRuleEventHandler(sheet, input, ruleText, enableWhenChecked) {
  this.sheet = sheet;
  this.input = input;
  this.text  = null;
  this.originalText = ruleText;
  this.isEnabled = false;
  this.enableWhenChecked = enableWhenChecked;
}
CSSRuleEventHandler.prototype = {
  enable: function() {
    if (this.isEnabled)
      return;

    if (this.text) {
      this.sheet.insertRule(this.text, 0);
      this.isEnabled = true;
      return;
    }

    let index = this.sheet.insertRule(this.originalText, 0);
    this.text = this.sheet.cssRules[index].cssText;
    this.isEnabled = true;
  },

  disable: function() {
    if (!this.isEnabled)
      return;

    let rules = this.sheet.cssRules;
    for (let i = 0; i < rules.length; i++) {
      if (rules[i].cssText === this.text) {
        this.sheet.deleteRule(i);
        this.isEnabled = false;
        return;
      }
    }
  },

  eventFilter: () => true,

  // DOMEventListener
  handleEvent: function(event) {
    if (!this.eventFilter(event))
      return;

    if (this.input.checked === this.enableWhenChecked)
      this.enable();
    else
      this.disable();
  }
};

