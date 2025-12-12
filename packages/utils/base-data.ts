export type BaseData = { id: string } | { _id: string };

export function getId(obj: BaseData) {
  if (obj && typeof obj === "object") {
    if ("id" in obj && typeof obj.id === "string") return obj.id;
    if ("_id" in obj && typeof obj._id === "string") return obj._id;
  }

  return "";
}
