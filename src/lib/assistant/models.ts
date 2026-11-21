import type Anthropic from "@anthropic-ai/sdk";

/**
 * Model settings for each assistant task. Routes spread these into their
 * requests, so changing a model or budget happens here and nowhere else.
 * The names shown to visitors live in ./model-labels; update them together.
 *
 * Neither task sends temperature/top_p/top_k or an assistant prefill: both
 * models reject them.
 */

/** Chat: short answers grounded in the profile, where time to first token matters most. */
export const chatModel = {
  model: "claude-haiku-5-5",
  max_tokens: 1024,
  // Thinking stays unset (adaptive); at low effort Haiku mostly answers straight away.
  output_config: { effort: "low" },
} satisfies Pick<Anthropic.MessageCreateParams, "model" | "max_tokens" | "output_config">;

/** Fit check: weighs a whole job description against the profile and returns a structured report. */
export const fitModel = {
  model: "claude-sonnet-5-5",
  max_tokens: 4000,
  output_config: { effort: "medium" },
  // If Sonnet declines on policy grounds, the API retries on its default fallback model in the same call.
  // The report comes back as JSON matching a schema, which needs the structured-outputs beta.
  betas: ["server-side-fallback-2026-07-01", "structured-outputs-2025-12-15"],
  fallbacks: "default",
} satisfies Pick<
  Anthropic.Beta.Messages.MessageCreateParams,
  "model" | "max_tokens" | "output_config" | "betas" | "fallbacks"
>;

/**
 * Per-request client options for chat. The call streams, so the timeout only
 * covers the wait for the response to start; two attempts of 40s fit inside
 * the route's 90s maxDuration.
 */
export const chatRequestOptions = {
  maxRetries: 1,
  timeout: 40_000,
} as const;

/**
 * Per-request client options for the fit check. The call does not stream, so
 * the timeout covers the whole generation: one long attempt inside the route's
 * 90s maxDuration, and no automatic retry that would pay for the input twice.
 */
export const fitRequestOptions = {
  maxRetries: 0,
  timeout: 80_000,
} as const;
