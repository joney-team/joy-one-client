export const parseEditorJSON = (rawValue?: string | null): object | null => {
  try {
    if (!rawValue || typeof rawValue !== "string" || rawValue.length === 0) return null;
    return JSON.parse(rawValue);
  } catch (error) {
    return null;
  }
};
