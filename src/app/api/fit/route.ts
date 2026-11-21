import type Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { getAnthropicClient, unusableReply } from "@/lib/assistant/anthropic";
import { fitReportSchema, fitRequestSchema, type FitReport } from "@/lib/assistant/contract";
import {
  assistantFailureResponse,
  jsonResponse,
  readJsonBody,
  rejectWhenRateLimited,
} from "@/lib/assistant/http";
import { fitModel, fitRequestOptions } from "@/lib/assistant/models";
import { fitLimits } from "@/lib/assistant/rate-limit";
import { fitSystemPrompt, fitUserMessage } from "@/lib/assistant/system-prompt";

export const maxDuration = 90;

// Built once: converting the schema to JSON Schema on every request is wasted work.
const fitReportFormat = betaZodOutputFormat(fitReportSchema);

/**
 * Reads the report out of Claude's reply. A declined or cut-off reply can
 * still carry a partial text block, so the stop reason decides before any
 * text is parsed. The last text block is the one to read: when the fallback
 * model answers, its text follows whatever the first model left behind.
 */
function reportFrom(message: Anthropic.Beta.Messages.BetaMessage): FitReport {
  const { stop_reason: stopReason } = message;
  if (stopReason === "refusal" || stopReason === "max_tokens") throw unusableReply(stopReason);

  const text = message.content.findLast((block) => block.type === "text")?.text;
  if (!text) throw unusableReply(stopReason);
  try {
    return fitReportFormat.parse(text);
  } catch {
    throw unusableReply(stopReason);
  }
}

export async function POST(request: Request): Promise<Response> {
  const body = await readJsonBody(request, fitRequestSchema);
  if (!body.ok) return body.response;

  const limited = rejectWhenRateLimited(request, fitLimits);
  if (limited) return limited;

  try {
    const client = getAnthropicClient();
    const message = await client.beta.messages.create(
      {
        ...fitModel,
        output_config: { ...fitModel.output_config, format: fitReportFormat },
        system: fitSystemPrompt,
        messages: [{ role: "user", content: fitUserMessage(body.data.jobDescription) }],
      },
      { ...fitRequestOptions, signal: request.signal },
    );
    return jsonResponse(reportFrom(message));
  } catch (error) {
    return assistantFailureResponse("fit", error);
  }
}
