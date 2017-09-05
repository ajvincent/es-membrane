function AttrControlHandler(input, attrTarget, attrName, attrValue, enableWhenChecked) {
  this.input = input;
  this.attrTarget = attrTarget;
  this.attrName = attrName;
  this.attrValue = attrValue;
  this.enableWhenChecked = enableWhenChecked;
}
AttrControlHandler.prototype.handleEvent = function() {
  const shouldEnable = (this.input.checked === this.enableWhenChecked);
  if (shouldEnable)
    this.attrTarget.setAttribute(this.attrName, this.attrValue);
  else if (this.attrTarget.getAttribute(this.attrName) === this.attrValue)
    this.attrTarget.removeAttribute(this.attrName);
};
