function MultistateHandler(event) {
  let multistate = event.currentTarget;
  multistate.appendChild(multistate.firstElementChild);
  updateMultistate(multistate);
}

function updateMultistate(multistate) {
  multistate.value = multistate.firstElementChild.dataset.state;
}
