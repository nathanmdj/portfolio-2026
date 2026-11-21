import { z } from "zod";

/**
 * Wire contract between the browser and the two assistant endpoints.
 * Both the route handlers and the client helpers import from here.
 *
 * POST /api/chat  body: ChatRequest  -> 200 text/plain stream of answer text
 * POST /api/fit   body: FitRequest   -> 200 application/json FitReport
 * Any failure     -> non-2xx application/json ApiError
 */

export const CHAT_LIMITS = {
  maxMessages: 20,
  maxMessageChars: 2000,
} as const;

export const FIT_LIMITS = {
  minChars: 80,
  maxChars: 8000,
} as const;

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(CHAT_LIMITS.maxMessageChars),
});

export const chatRequestSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1)
    .max(CHAT_LIMITS.maxMessages)
    .refine((messages) => messages[messages.length - 1]?.role === "user", {
      message: "The last message must come from the user.",
    }),
});

export const fitRequestSchema = z.object({
  jobDescription: z.string().trim().min(FIT_LIMITS.minChars).max(FIT_LIMITS.maxChars),
});

export const fitVerdicts = ["strong", "good", "partial", "weak"] as const;

/**
 * An honest read of a job description against the profile. No numeric score:
 * a verdict plus the evidence behind it is more useful than a made-up number.
 */
export const fitReportSchema = z.object({
  verdict: z.enum(fitVerdicts),
  summary: z.string(),
  matches: z.array(
    z.object({
      requirement: z.string(),
      evidence: z.string(),
    }),
  ),
  gaps: z.array(
    z.object({
      requirement: z.string(),
      note: z.string(),
    }),
  ),
  questionsToAsk: z.array(z.string()),
});

export const apiErrorSchema = z.object({
  error: z.string(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type FitRequest = z.infer<typeof fitRequestSchema>;
export type FitVerdict = (typeof fitVerdicts)[number];
export type FitReport = z.infer<typeof fitReportSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
