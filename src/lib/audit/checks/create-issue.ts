import { randomUUID } from "crypto";
import type { SeoIssue, SeoSeverity } from "../types";

export const createIssue = (
  type: string,
  severity: SeoSeverity,
  title: string,
  message: string,
): SeoIssue => ({
  id: randomUUID(),
  type,
  severity,
  title,
  message,
});
