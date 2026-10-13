"use client";

import { toast } from "sonner";

// A stable id updates the current result instead of stacking duplicate messages.
const actionId = "hrpf-action-feedback";
export const notify = {
  success(message: string, id = actionId) {
    if (message) toast.success(message, { id, duration: 4000 });
  },
  error(message: string, id = actionId) {
    if (message) toast.error(message, { id, duration: Infinity });
  },
  warning(message: string, id = actionId) {
    if (message) toast.warning(message, { id, duration: Infinity });
  },
  failure(message: string) {
    if (/draft.*saved.*publication failed/i.test(message)) this.warning(message);
    else this.error(message);
  },
  result(message: string) {
    if (!message) return;
    if (/but .*fail|saved.*publication failed/i.test(message)) this.warning(message);
    else this.success(message);
  },
  dismiss(id = actionId) { toast.dismiss(id); },
};
