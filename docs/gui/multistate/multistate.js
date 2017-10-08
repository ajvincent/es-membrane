function MultistateHandler(event) {
  let multistate = event.target;
  if (multistate.localName.toLowerCase() === "span")
    multistate = multistate.parentNode;
  if (!multistate.classList.contains("multistate"))
    return;
  multistate.appendChild(multistate.firstElementChild);
  updateMultistate(multistate);
}

function updateMultistate(multistate) {
  multistate.value = multistate.firstElementChild.dataset.state;
}
