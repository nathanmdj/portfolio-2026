import Anthropic from "@anthropic-ai/sdk";

/**
 * The server's Claude client, plus the two ways an assistant call can fail
 * without the API itself returning an error.
 */

/** No API key is configured, so the assistant cannot run at all. */
export class AssistantOfflineError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY is not set.");
    this.name = "AssistantOfflineError";
  }
}

export type UnusableReplyReason = "refusal" | "max_tokens" | "empty";

/** Claude answered, but there is nothing in the answer worth showing. */
export class UnusableReplyError extends Error {
  constructor(readonly reason: UnusableReplyReason) {
    super(`The model returned no usable output (${reason}).`);
    this.name = "UnusableReplyError";
  }
}

/** Turns a stop reason that came with no usable output into the matching error. */
export function unusableReply(stopReason: string | null): UnusableReplyError {
  if (stopReason === "refusal" || stopReason === "max_tokens") {
    return new UnusableReplyError(stopReason);
  }
  return new UnusableReplyError("empty");
}

let client: Anthropic | null = null;

/**
 * Returns the shared client, creating it on first use. The SDK reads
 * ANTHROPIC_API_KEY from the environment itself; the key never leaves the
 * server and is never logged.
 */
export function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY?.trim()) {
    throw new AssistantOfflineError();
  }
  client ??= new Anthropic();
  return client;
}
