export function createInvitationState() {
  return { screen: "invitation", declineAttempts: 0, shouldMove: false, message: "" };
}

export function applyDecline(state, { reducedMotion = false } = {}) {
  if (reducedMotion || state.declineAttempts >= 2) {
    return { ...state, screen: "declined", shouldMove: false, message: "" };
  }

  const declineAttempts = state.declineAttempts + 1;
  return {
    ...state,
    declineAttempts,
    shouldMove: true,
    message: declineAttempts === 1 ? "再考虑一下嘛～" : "真的不再想想吗？",
  };
}

export function validateDetails({ date, time, restaurant }) {
  const errors = {};
  if (!date) errors.date = "请选择日期";
  if (!time) errors.time = "请选择时间";
  if (!restaurant.trim()) errors.restaurant = "请填写餐厅或想吃的东西";
  return errors;
}

export function createConfirmation({ date, time, restaurant }) {
  return { date, time, restaurant: restaurant.trim() };
}
