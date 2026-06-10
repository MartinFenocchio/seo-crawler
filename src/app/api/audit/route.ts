import { NextResponse } from "next/server";
import { z } from "zod";
import { auditSite } from "@/lib/audit/audit-site";
import type { AuditErrorResponse } from "@/lib/audit/types";

export const maxDuration = 300;

const auditRequestSchema = z.object({
  url: z
    .string()
    .min(1, "URL is required.")
    .refine(
      (value) => {
        try {
          const parsed = new URL(value);
          return (
            parsed.protocol === "http:" || parsed.protocol === "https:"
          );
        } catch {
          return false;
        }
      },
      { message: "Enter a valid http:// or https:// URL." },
    ),
});

export const POST = async (request: Request) => {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json<AuditErrorResponse>(
      { error: "Invalid request body", details: "Expected JSON." },
      { status: 400 },
    );
  }

  const parsed = auditRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json<AuditErrorResponse>(
      {
        error: "Invalid request",
        details: parsed.error.issues[0]?.message ?? "Validation failed.",
      },
      { status: 400 },
    );
  }

  try {
    const result = await auditSite(parsed.data.url);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Audit failed.";

    return NextResponse.json<AuditErrorResponse>(
      { error: message.split(":")[0] ?? "Audit failed", details: message },
      { status: 422 },
    );
  }
};
