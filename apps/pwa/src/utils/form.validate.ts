import { t } from "@lingui/core/macro";

export const required = (value: any) => {
  let isValid = true;

  if (typeof value === null || typeof value === "undefined") {
    isValid = false;
  }

  if (Array.isArray(value) && value.length === 0) {
    isValid = false;
  }

  if (typeof value === "string" && value.trim() === "") {
    isValid = false;
  }

  if (!isValid) return t`Must be provided`;
};
