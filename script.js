import {
  createConfirmation,
  validateDetails,
} from "./invitation-state.js";

const views = [...document.querySelectorAll(".view")];
const phoneShell = document.querySelector(".phone-shell");
const acceptButton = document.querySelector("#accept-button");
const declineButton = document.querySelector("#decline-button");
const declineHint = document.querySelector("#decline-hint");
const detailsForm = document.querySelector("#details-form");
const restartButton = document.querySelector("#restart-button");
const confirmationDetails = document.querySelector("#confirmation-details");

const focusTargets = {
  "invitation-view": document.querySelector("#invitation-heading"),
  "details-view": document.querySelector("#date-input"),
  "success-view": document.querySelector("#success-heading"),
  "declined-view": document.querySelector("#declined-heading"),
};

const declineMessages = [
  "抓不到我～",
  "再考虑一下嘛 ♡",
  "这个按钮今天点不了 😌",
  "只能选上面那个啦～",
  "嘿嘿，点不到～",
];

function showView(id) {
  for (const view of views) {
    view.hidden = view.id !== id;
  }

  const focusTarget = focusTargets[id];
  focusTarget?.focus();
}

function escapeDeclineButton() {
  const shellRect = phoneShell.getBoundingClientRect();
  const buttonRect = declineButton.getBoundingClientRect();

  const margin = 14;

  // 第一次逃跑时，把按钮变成 fixed，
  // 这样就可以在整个页面区域里移动
  if (declineButton.style.position !== "fixed") {
    declineButton.style.width = `${buttonRect.width}px`;
    declineButton.style.position = "fixed";
    declineButton.style.left = `${buttonRect.left}px`;
    declineButton.style.top = `${buttonRect.top}px`;
    declineButton.style.margin = "0";
    declineButton.style.transform = "none";
  }

  // 控制按钮不要跑出页面
  const minLeft = shellRect.left + margin;

  const maxLeft = Math.max(
    minLeft,
    shellRect.right - buttonRect.width - margin
  );

  const minTop = shellRect.top + margin;

  const maxTop = Math.max(
    minTop,
    shellRect.bottom - buttonRect.height - margin
  );

  let nextLeft;
  let nextTop;
  let attempts = 0;

  // 随机找一个新的位置
  // 并且尽量不要只移动一点点
  do {
    nextLeft =
      minLeft +
      Math.random() * (maxLeft - minLeft);

    nextTop =
      minTop +
      Math.random() * (maxTop - minTop);

    attempts += 1;

  } while (
    attempts < 8 &&
    Math.hypot(
      nextLeft - buttonRect.left,
      nextTop - buttonRect.top
    ) < 90
  );

  declineButton.style.left = `${nextLeft}px`;
  declineButton.style.top = `${nextTop}px`;

  declineHint.textContent =
    declineMessages[
      Math.floor(Math.random() * declineMessages.length)
    ];
}

function resetDeclineButton() {
  declineButton.style.position = "";
  declineButton.style.left = "";
  declineButton.style.top = "";
  declineButton.style.width = "";
  declineButton.style.margin = "";
  declineButton.style.transform = "";
}

function renderErrors(errors) {
  let firstInvalidInput;

  for (const field of [
    "date",
    "time",
    "restaurant"
  ]) {
    const input =
      document.querySelector(`#${field}-input`);

    const error =
      document.querySelector(`#${field}-error`);

    error.textContent =
      errors[field] ?? "";

    input.setAttribute(
      "aria-invalid",
      String(Boolean(errors[field]))
    );

    if (
      errors[field] &&
      !firstInvalidInput
    ) {
      firstInvalidInput = input;
    }
  }

  return firstInvalidInput;
}

function renderConfirmation(details) {
  confirmationDetails.replaceChildren();

  for (
    const [label, value]
    of [
      ["日期", details.date],
      ["时间", details.time],
      ["餐厅", details.restaurant]
    ]
  ) {

    const term =
      document.createElement("dt");

    const description =
      document.createElement("dd");

    term.textContent = label;
    description.textContent = value;

    confirmationDetails.append(
      term,
      description
    );
  }
}


// ===============================
// 好呀按钮
// ===============================

acceptButton.addEventListener(
  "click",
  () => {
    showView("details-view");
  }
);


// ===============================
// 再想想按钮：永远点不到
// ===============================

// 电脑：鼠标一靠近就跑
declineButton.addEventListener(
  "pointerenter",
  escapeDeclineButton
);


// 手机：手指刚碰到就跑
declineButton.addEventListener(
  "pointerdown",
  (event) => {

    event.preventDefault();

    escapeDeclineButton();
  }
);


// 防止真的触发 click
declineButton.addEventListener(
  "click",
  (event) => {

    event.preventDefault();

    escapeDeclineButton();
  }
);


// 键盘也无法选择
declineButton.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "Enter" ||
      event.key === " "
    ) {

      event.preventDefault();

      escapeDeclineButton();
    }
  }
);


// ===============================
// 表单
// ===============================

detailsForm.addEventListener(
  "submit",
  (event) => {

    event.preventDefault();

    const details =
      Object.fromEntries(
        new FormData(detailsForm)
      );

    const errors =
      validateDetails(details);

    const firstInvalidInput =
      renderErrors(errors);

    if (
      Object.keys(errors).length > 0
    ) {

      firstInvalidInput?.focus();

      return;
    }

    renderConfirmation(
      createConfirmation(details)
    );

    showView("success-view");
  }
);


// ===============================
// 重新开始
// ===============================

restartButton.addEventListener(
  "click",
  () => {

    detailsForm.reset();

    renderErrors({});

    resetDeclineButton();

    declineHint.textContent = "";

    showView("invitation-view");
  }
);
