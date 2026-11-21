import type Anthropic from "@anthropic-ai/sdk";
import type { MessageStream } from "@anthropic-ai/sdk/lib/MessageStream";
import { getAnthropicClient, unusableReply } from "@/lib/assistant/anthropic";
import { chatRequestSchema, type ChatMessage } from "@/lib/assistant/contract";
import {
  assistantFailureResponse,
  logAssistantFailure,
  readJsonBody,
  rejectWhenRateLimited,
  TEXT_STREAM_HEADERS,
} from "@/lib/assistant/http";
import { chatModel, chatRequestOptions } from "@/lib/assistant/models";
import { chatLimits } from "@/lib/assistant/rate-limit";
import { chatSystemPrompt } from "@/lib/assistant/system-prompt";

export const maxDuration = 90;

/**
 * The API expects the conversation to open with a visitor turn, so any
 * assistant greeting the UI keeps at the top of the history is dropped.
 */
function toClaudeMessages(messages: ChatMessage[]): Anthropic.MessageParam[] {
  const firstUser = messages.findIndex((message) => message.role === "user");
  return messages.slice(firstUser).map(({ role, content }) => ({ role, content }));
}

/**
 * Yields the answer's text as it arrives, then throws if the reply is not a
 * finished answer: it has no text at all, it was declined, or it ran out of
 * tokens mid-sentence. Before the first chunk that becomes an error status;
 * after it, it breaks the stream so the browser knows the text is incomplete.
 */
async function* answerText(stream: MessageStream): AsyncGenerator<string, void> {
  let sentText = false;
  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta" && event.delta.text) {
      sentText = true;
      yield event.delta.text;
    }
  }
  const { stop_reason: stopReason } = await stream.finalMessage();
  if (!sentText || stopReason === "refusal" || stopReason === "max_tokens") {
    throw unusableReply(stopReason);
  }
}

/**
 * Streams the rest of the answer as UTF-8. Once the first byte is out the
 * status can no longer change, so a later failure errors the stream: the
 * browser's read then rejects instead of seeing a clean end, and the visitor
 * is told the answer was cut off.
 */
function answerBody(
  firstChunk: string,
  rest: AsyncGenerator<string, void>,
  stream: MessageStream,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(firstChunk));
    },
    async pull(controller) {
      try {
        const next = await rest.next();
        if (next.done) controller.close();
        else controller.enqueue(encoder.encode(next.value));
      } catch (error) {
        logAssistantFailure("chat", error);
        // A no-op when the visitor already went away and the stream is cancelled.
        controller.error(error);
      }
    },
    cancel() {
      stream.abort();
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  const body = await readJsonBody(request, chatRequestSchema);
  if (!body.ok) return body.response;

  const limited = rejectWhenRateLimited(request, chatLimits);
  if (limited) return limited;

  try {
    const client = getAnthropicClient();
    const stream = client.messages.stream(
      {
        ...chatModel,
        system: chatSystemPrompt,
        messages: toClaudeMessages(body.data.messages),
      },
      { ...chatRequestOptions, signal: request.signal },
    );

    // Wait for the first piece of text so failures before it get a real status.
    const rest = answerText(stream);
    const first = await rest.next();
    if (first.done) throw unusableReply(null);

    return new Response(answerBody(first.value, rest, stream), { headers: TEXT_STREAM_HEADERS });
  } catch (error) {
    return assistantFailureResponse("chat", error);
  }
}
