import {
  applyDecline,
  createConfirmation,
  createInvitationState,
  validateDetails,
} from "./invitation-state.js";

const views = [...document.querySelectorAll(".view")];
const acceptButton = document.querySelector("#accept-button");
const declineButton = document.querySelector("#decline-button");
const declineHint = document.querySelector("#decline-hint");
const detailsForm = document.querySelector("#details-form");
const restartButton = document.querySelector("#restart-button");
const confirmationDetails = document.querySelector("#confirmation-details");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const focusTargets = {
  "invitation-view": document.querySelector("#invitation-heading"),
  "details-view": document.querySelector("#date-input"),
  "success-view": document.querySelector("#success-heading"),
  "declined-view": document.querySelector("#declined-heading"),
};
let invitationState = createInvitationState();

function showView(id) {
  for (const view of views) view.hidden = view.id !== id;
  const focusTarget = focusTargets[id];
  focusTarget?.focus();
}

function moveDeclineButton() {
  const direction = invitationState.declineAttempts % 2 === 1 ? 1 : -1;
  declineButton.style.transform = `translateX(${direction * 44}px)`;
}

function renderErrors(errors) {
  let firstInvalidInput;
  for (const field of ["date", "time", "restaurant"]) {
    const input = document.querySelector(`#${field}-input`);
    const error = document.querySelector(`#${field}-error`);
    error.textContent = errors[field] ?? "";
    input.setAttribute("aria-invalid", String(Boolean(errors[field])));
    if (errors[field] && !firstInvalidInput) firstInvalidInput = input;
  }
  return firstInvalidInput;
}

function renderConfirmation(details) {
  confirmationDetails.replaceChildren();
  for (const [label, value] of [["日期", details.date], ["时间", details.time], ["餐厅", details.restaurant]]) {
    const term = document.createElement("dt");
    const description = document.createElement("dd");
    term.textContent = label;
    description.textContent = value;
    confirmationDetails.append(term, description);
  }
}

acceptButton.addEventListener("click", () => showView("details-view"));

declineButton.addEventListener("click", (event) => {
  invitationState = applyDecline(invitationState, {
    reducedMotion: reducedMotion.matches || event.detail === 0,
  });

  declineHint.textContent = invitationState.message;

  if (invitationState.screen === "declined") {
    showView("declined-view");
  } else if (invitationState.shouldMove) {
    moveDeclineButton();
  }
});

detailsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const details = Object.fromEntries(new FormData(detailsForm));
  const errors = validateDetails(details);
  const firstInvalidInput = renderErrors(errors);
  if (Object.keys(errors).length > 0) {
    firstInvalidInput?.focus();
    return;
  }
  renderConfirmation(createConfirmation(details));
  showView("success-view");
});

restartButton.addEventListener("click", () => {
  detailsForm.reset();
  renderErrors({});
  invitationState = createInvitationState();
  declineButton.style.transform = "";
  declineHint.textContent = "";
  showView("invitation-view");
});
