import {
  apiErrorSchema,
  fitReportSchema,
  type ChatMessage,
  type ChatRequest,
  type FitReport,
  type FitRequest,
} from "./contract";

/**
 * Browser-side calls to the two assistant endpoints. Every failure comes out
 * as an AssistantRequestError whose message is safe to show to a visitor.
 */

type AssistantFailureKind =
  /** The caller cancelled through its AbortSignal. */
  | "aborted"
  /** The request never reached the server, or the connection dropped. */
  | "network"
  /** The server answered with a non-2xx status. */
  | "server"
  /** The server answered 2xx but the body was not what the contract promises. */
  | "malformed";

const FAILURE_MESSAGES: Record<AssistantFailureKind, string> = {
  aborted: "The request was cancelled.",
  network: "Could not reach the assistant. Check your connection and try again.",
  server: "The assistant is unavailable right now. Please try again in a moment.",
  malformed: "The assistant sent back something unexpected. Please try again.",
};

const INTERRUPTED_MESSAGE = "The answer was cut off before it finished. Please try again.";

export class AssistantRequestError extends Error {
  readonly kind: AssistantFailureKind;
  /** HTTP status, when the server answered at all. */
  readonly status?: number;

  constructor(
    kind: AssistantFailureKind,
    message: string = FAILURE_MESSAGES[kind],
    options: { status?: number; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "AssistantRequestError";
    this.kind = kind;
    this.status = options.status;
  }
}

/** The text to show a visitor for anything a request helper threw. */
export function describeFailure(error: unknown): string {
  return error instanceof AssistantRequestError ? error.message : FAILURE_MESSAGES.server;
}

/** Classifies a thrown value, telling a deliberate cancel apart from a real fault. */
function toRequestError(
  cause: unknown,
  signal: AbortSignal | undefined,
  otherwise: AssistantFailureKind,
  message?: string,
): AssistantRequestError {
  if (cause instanceof AssistantRequestError) return cause;
  const aborted = signal?.aborted || (cause instanceof DOMException && cause.name === "AbortError");
  if (aborted) return new AssistantRequestError("aborted", undefined, { cause });
  return new AssistantRequestError(otherwise, message, { cause });
}

/** Uses the server's own error text when the body is an ApiError, a generic line otherwise. */
async function errorFromResponse(response: Response): Promise<AssistantRequestError> {
  let serverMessage: string | undefined;
  try {
    const parsed = apiErrorSchema.safeParse(await response.json());
    if (parsed.success && parsed.data.error.trim()) serverMessage = parsed.data.error.trim();
  } catch {
    // Not JSON (a proxy page, an empty body): fall back to the generic message.
  }
  return new AssistantRequestError("server", serverMessage, { status: response.status });
}

async function postJson(
  path: string,
  body: ChatRequest | FitRequest,
  signal: AbortSignal | undefined,
): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch (cause) {
    throw toRequestError(cause, signal, "network");
  }
  if (!response.ok) {
    const failure = await errorFromResponse(response);
    throw signal?.aborted ? new AssistantRequestError("aborted") : failure;
  }
  return response;
}

type StreamChatOptions = {
  signal?: AbortSignal;
  /** Called with each decoded chunk of answer text, in order. */
  onDelta: (delta: string) => void;
};

/**
 * Sends the conversation and streams the answer back. Resolves with the
 * full answer once the stream ends.
 */
export async function streamChat(
  messages: ChatMessage[],
  { signal, onDelta }: StreamChatOptions,
): Promise<string> {
  const response = await postJson("/api/chat", { messages }, signal);

  let answer = "";
  const emit = (delta: string) => {
    if (!delta) return;
    answer += delta;
    onDelta(delta);
  };

  try {
    if (!response.body) {
      emit(await response.text());
      return answer;
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        // stream: true holds back a multi-byte character split across chunks.
        emit(decoder.decode(value, { stream: true }));
      }
      emit(decoder.decode());
    } finally {
      reader.releaseLock();
    }
  } catch (cause) {
    throw toRequestError(cause, signal, "network", INTERRUPTED_MESSAGE);
  }
  return answer;
}

/** Asks for a fit report on a job description and checks it against the contract. */
export async function requestFit(
  jobDescription: string,
  { signal }: { signal?: AbortSignal } = {},
): Promise<FitReport> {
  const response = await postJson("/api/fit", { jobDescription }, signal);

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (cause) {
    throw toRequestError(cause, signal, "malformed");
  }

  const parsed = fitReportSchema.safeParse(payload);
  if (!parsed.success) throw new AssistantRequestError("malformed", undefined, { cause: parsed.error });
  return parsed.data;
}
