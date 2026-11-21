import { useCallback, useEffect, useRef, useState } from "react";
import { describeFailure, streamChat } from "@/lib/assistant/client";
import { CHAT_LIMITS, type ChatMessage } from "@/lib/assistant/contract";

export type ChatStatus = "idle" | "streaming" | "error";

export type ChatEntry = ChatMessage & { id: string };

const EMPTY_REPLY_MESSAGE = "The assistant returned an empty answer. Please try again.";

let lastEntryId = 0;
function nextEntryId(): string {
  lastEntryId += 1;
  return `chat-${lastEntryId}`;
}

/** Cuts visitor input down to what the chat endpoint accepts. */
function clampChatInput(text: string): string {
  return text.trim().slice(0, CHAT_LIMITS.maxMessageChars).trim();
}

/**
 * The slice of the conversation sent with each request: the most recent turns
 * that fit the endpoint's limits, starting and ending on a visitor message.
 * Long answers are clipped too, since every message has the same size cap.
 */
function historyForRequest(entries: readonly ChatMessage[]): ChatMessage[] {
  const usable = entries
    .map(({ role, content }) => ({ role, content: clampChatInput(content) }))
    .filter((message) => message.content.length > 0);

  let end = usable.length;
  while (end > 0 && usable[end - 1].role !== "user") end -= 1;

  let start = Math.max(0, end - CHAT_LIMITS.maxMessages);
  while (start < end && usable[start].role !== "user") start += 1;

  return usable.slice(start, end);
}

export function useChat() {
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const activeRequest = useRef<AbortController | null>(null);
  const pendingFrame = useRef<number | null>(null);

  const cancelPendingFrame = useCallback(() => {
    if (pendingFrame.current === null) return;
    cancelAnimationFrame(pendingFrame.current);
    pendingFrame.current = null;
  }, []);

  /** Drops the in-flight request so nothing it does later touches state. */
  const cancelActiveRequest = useCallback(() => {
    const request = activeRequest.current;
    activeRequest.current = null;
    request?.abort();
    cancelPendingFrame();
  }, [cancelPendingFrame]);

  const requestReply = useCallback(
    async (history: ChatEntry[]) => {
      const outgoing = historyForRequest(history);
      if (outgoing.length === 0) return;

      cancelActiveRequest();
      const controller = new AbortController();
      activeRequest.current = controller;
      const isCurrent = () => activeRequest.current === controller;

      const replyId = nextEntryId();
      let received = "";

      const showReceived = () => {
        pendingFrame.current = null;
        const content = received;
        setMessages((current) =>
          current.map((entry) => (entry.id === replyId ? { ...entry, content } : entry)),
        );
      };
      const dropReply = () =>
        setMessages((current) => current.filter((entry) => entry.id !== replyId));
      // Whatever part of the answer arrived stays on screen; an empty reply is removed.
      const settleReply = () => {
        if (received.trim()) showReceived();
        else dropReply();
      };
      const fail = (message: string) => {
        settleReply();
        setError(message);
        setStatus("error");
      };

      setMessages([...history, { id: replyId, role: "assistant", content: "" }]);
      setError(null);
      setStatus("streaming");

      try {
        await streamChat(outgoing, {
          signal: controller.signal,
          onDelta: (delta) => {
            received += delta;
            // One state update per frame, however many chunks arrive in it.
            if (isCurrent() && pendingFrame.current === null) {
              pendingFrame.current = requestAnimationFrame(showReceived);
            }
          },
        });
        if (!isCurrent()) return;
        cancelPendingFrame();
        if (received.trim()) {
          showReceived();
          setStatus("idle");
        } else {
          fail(EMPTY_REPLY_MESSAGE);
        }
      } catch (cause) {
        if (!isCurrent()) return;
        cancelPendingFrame();
        if (controller.signal.aborted) {
          // Stopped by the visitor.
          settleReply();
          setStatus("idle");
        } else {
          fail(describeFailure(cause));
        }
      } finally {
        if (isCurrent()) activeRequest.current = null;
      }
    },
    [cancelActiveRequest, cancelPendingFrame],
  );

  /** Sends a visitor message. Returns false when nothing was sent. */
  const send = useCallback(
    (text: string): boolean => {
      const content = clampChatInput(text);
      if (!content || status === "streaming") return false;
      void requestReply([...messages, { id: nextEntryId(), role: "user", content }]);
      return true;
    },
    [messages, status, requestReply],
  );

  const stop = useCallback(() => {
    activeRequest.current?.abort();
  }, []);

  /** Asks again for the answer that failed, replacing any cut-off part of it. */
  const retry = useCallback(() => {
    if (status !== "error") return;
    let end = messages.length;
    while (end > 0 && messages[end - 1].role !== "user") end -= 1;
    void requestReply(messages.slice(0, end));
  }, [messages, status, requestReply]);

  const reset = useCallback(() => {
    cancelActiveRequest();
    setMessages([]);
    setError(null);
    setStatus("idle");
  }, [cancelActiveRequest]);

  useEffect(() => cancelActiveRequest, [cancelActiveRequest]);

  return { messages, status, error, send, stop, retry, reset };
}
