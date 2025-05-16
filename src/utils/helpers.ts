import { randomUUID } from "crypto";

export function parseBoolean(value: unknown): boolean {
    if (typeof value !== "string") return false;
    const normalized = value.trim().toLowerCase();
    if (["true", "1"].includes(normalized)) return true;
    if (["false", "0"].includes(normalized)) return false;
    return false;
  }
  
  export const generateUniqueId = () => {
    return randomUUID()
  }