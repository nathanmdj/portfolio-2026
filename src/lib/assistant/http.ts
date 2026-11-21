import Anthropic from "@anthropic-ai/sdk";
import type { z } from "zod";
import { AssistantOfflineError, UnusableReplyError } from "@/lib/assistant/anthropic";
import { CHAT_LIMITS, FIT_LIMITS, type ApiError } from "@/lib/assistant/contract";
import { checkRouteLimits, clientIp, type RouteLimits } from "@/lib/assistant/rate-limit";

/** Request and response plumbing shared by the assistant route handlers. */

/**
 * Largest request body either endpoint accepts, sized so that anything the
 * contract allows gets through: its limits count characters, and a character
 * can take up to four bytes on the wire, plus room for the JSON around them.
 */
const MAX_BODY_BYTES =
  Math.max(CHAT_LIMITS.maxMessages * CHAT_LIMITS.maxMessageChars, FIT_LIMITS.maxChars) * 4 + 8 * 1024;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
} as const;

export const TEXT_STREAM_HEADERS = {
  ...NO_STORE_HEADERS,
  "Content-Type": "text/plain; charset=utf-8",
} as const;

export function jsonResponse(body: unknown, status = 200, headers?: HeadersInit): Response {
  const merged = new Headers(headers);
  for (const [name, value] of Object.entries(NO_STORE_HEADERS)) merged.set(name, value);
  return Response.json(body, { status, headers: merged });
}

export function jsonError(status: number, message: string, headers?: HeadersInit): Response {
  const body: ApiError = { error: message };
  return jsonResponse(body, status, headers);
}

export type BodyResult<T> = { ok: true; data: T } | { ok: false; response: Response };

class BodyTooLargeError extends Error {}

/** Reads the body as text, stopping as soon as it passes the size limit. */
async function readBoundedText(request: Request): Promise<string> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new BodyTooLargeError();
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}

/**
 * Parses a JSON request body and validates it against a contract schema.
 * Rejects non-JSON content types, bodies over MAX_BODY_BYTES (by the declared
 * content-length and by the bytes actually received) and invalid shapes.
 */
export async function readJsonBody<Schema extends z.ZodType>(
  request: Request,
  schema: Schema,
): Promise<BodyResult<z.output<Schema>>> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return { ok: false, response: jsonError(415, "Send the request as JSON.") };
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return { ok: false, response: jsonError(413, "The request is too large.") };
  }

  let raw: string;
  try {
    raw = await readBoundedText(request);
  } catch (error) {
    if (error instanceof BodyTooLargeError) {
      return { ok: false, response: jsonError(413, "The request is too large.") };
    }
    return { ok: false, response: jsonError(400, "The request body could not be read.") };
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, response: jsonError(400, "The request body is not valid JSON.") };
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    // Messages come from the contract schemas, not from user input.
    const issue = parsed.error.issues[0];
    const where = issue?.path.length ? `${issue.path.join(".")}: ` : "";
    return {
      ok: false,
      response: jsonError(400, `Invalid request. ${where}${issue?.message ?? "Check the fields."}`),
    };
  }
  return { ok: true, data: parsed.data };
}

/** Returns a 429 response when the caller is over budget, or null to continue. */
export function rejectWhenRateLimited(request: Request, limits: RouteLimits): Response | null {
  const decision = checkRouteLimits(limits, clientIp(request));
  if (decision.allowed) return null;
  const minutes = Math.max(1, Math.ceil(decision.retryAfterSeconds / 60));
  return jsonError(
    429,
    `Too many requests. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    { "Retry-After": String(decision.retryAfterSeconds) },
  );
}

export type AssistantFailure = { status: number; body: ApiError };

const OFFLINE = "The assistant is offline right now.";
const BUSY = "The assistant is busy, try again shortly.";

function failure(status: number, error: string): AssistantFailure {
  return { status, body: { error } };
}

/**
 * Maps anything thrown while calling Claude to a status and a message that is
 * safe to show visitors. Upstream error text never reaches the response.
 */
function toAssistantFailure(error: unknown): AssistantFailure {
  if (error instanceof AssistantOfflineError) return failure(503, OFFLINE);
  if (error instanceof UnusableReplyError) {
    return error.reason === "refusal"
      ? failure(422, "The assistant can't help with that request.")
      : failure(502, "The assistant couldn't finish an answer. Try asking in a different way.");
  }
  if (error instanceof Anthropic.RateLimitError) return failure(429, BUSY);
  if (error instanceof Anthropic.OverloadedError) return failure(503, BUSY);
  // Credential, billing and permission problems are on the site owner's side.
  if (
    error instanceof Anthropic.AuthenticationError ||
    error instanceof Anthropic.PermissionDeniedError ||
    error instanceof Anthropic.PaymentRequiredError
  ) {
    return failure(503, OFFLINE);
  }
  if (error instanceof Anthropic.BadRequestError) {
    return failure(502, "The assistant couldn't process that request.");
  }
  if (error instanceof Anthropic.APIUserAbortError) return failure(499, "The request was cancelled.");
  if (error instanceof Anthropic.APIConnectionTimeoutError) return failure(504, BUSY);
  if (error instanceof Anthropic.APIConnectionError) {
    return failure(502, "The assistant couldn't be reached. Try again shortly.");
  }
  if (error instanceof Anthropic.APIError) return failure(502, "The assistant ran into a problem. Try again shortly.");
  return failure(500, "Something went wrong. Try again shortly.");
}

/**
 * Logs a failed assistant call with only its class and status, never its
 * message or request, so neither visitor input nor credentials end up in logs.
 */
export function logAssistantFailure(route: string, error: unknown): void {
  if (error instanceof Anthropic.APIUserAbortError) return;
  const kind = error instanceof Error ? error.name : typeof error;
  if (error instanceof Anthropic.APIError) {
    const { status, errorCode, requestID } = error;
    console.error(`[assistant:${route}] ${kind}`, { status, errorCode, requestID });
  } else if (error instanceof UnusableReplyError) {
    console.error(`[assistant:${route}] ${kind}`, { reason: error.reason });
  } else {
    console.error(`[assistant:${route}] ${kind}`);
  }
}

export function assistantFailureResponse(route: string, error: unknown): Response {
  logAssistantFailure(route, error);
  const { status, body } = toAssistantFailure(error);
  return jsonResponse(body, status);
}
