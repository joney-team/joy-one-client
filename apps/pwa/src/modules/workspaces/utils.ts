export function decodeWorkspace(input: string, plainCode?: string) {
  // Validate input
  if (typeof input !== "string" || input.length === 0) {
    throw new Error("Input must be a non-empty string.");
  }

  // Regex to match code
  const regex = /^([A-Z]+)(\d+)([A-Z]*)$/;
  const match = input.match(regex);

  if (!match) {
    throw new Error("Invalid code format.");
  }

  // Extract workspace code, code, and entity
  const workspaceCode = match[1];
  const code = match[2];
  const entity = match[3];

  return { workspaceCode, code: plainCode || code, entity, count: +code };
}

export function renderEntityCode(workspaceCode?: string, plainCode?: string | null) {
  if (!workspaceCode) return plainCode || "";
  if (plainCode) return plainCode || "";

  try {
    const decoded = decodeWorkspace(workspaceCode);
    return `#${decoded.workspaceCode}${decoded.code}`;
  } catch (error) {
    return workspaceCode || "";
  }
}
