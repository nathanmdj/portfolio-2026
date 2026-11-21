import { useEffect, useRef } from "react";
import { Sparkle } from "@phosphor-icons/react";
import { suggestedQuestions } from "@/content/profile";
import { BulletList } from "@/components/ui/bullet-list";
import { Chip } from "@/components/ui/chip";
import { RequestFailedNotice } from "@/components/ui/request-failed-notice";
import type { ChatEntry, ChatStatus } from "./use-chat";

/** How close to the bottom (px) still counts as "reading the latest". */
const FOLLOW_THRESHOLD_PX = 96;

type ChatThreadProps = {
  messages: ChatEntry[];
  status: ChatStatus;
  error: string | null;
  onAsk: (question: string) => void;
  onRetry: () => void;
};

export function ChatThread({ messages, status, error, onAsk, onRetry }: ChatThreadProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const following = useRef(true);
  const renderedCount = useRef(0);

  // Keeps the newest text in view, unless the visitor has scrolled up to reread.
  // A new turn always scrolls, since the visitor just asked for it.
  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    const newTurn = messages.length > renderedCount.current;
    renderedCount.current = messages.length;
    if (newTurn || following.current) element.scrollTop = element.scrollHeight;
  }, [messages, status, error]);

  const trackPosition = () => {
    const element = scroller.current;
    if (!element) return;
    following.current =
      element.scrollHeight - element.scrollTop - element.clientHeight < FOLLOW_THRESHOLD_PX;
  };

  const lastIndex = messages.length - 1;

  return (
    <div
      ref={scroller}
      onScroll={trackPosition}
      role="region"
      aria-label="Conversation"
      tabIndex={0}
      // The panel clips its rounded corners, so the focus ring is drawn inside.
      className="min-h-[min(10rem,25dvh)] flex-1 overflow-y-auto overscroll-contain px-4 py-5 focus-visible:-outline-offset-2"
    >
      {messages.length === 0 && <SuggestedQuestions onAsk={onAsk} />}

      <div role="log" aria-live="polite" aria-relevant="additions" className="flex flex-col gap-4">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            live={status === "streaming" && index === lastIndex && message.role === "assistant"}
          />
        ))}
      </div>

      <div role="alert">
        {status === "error" && error && (
          <RequestFailedNotice message={error} onRetry={onRetry} className="mt-4" />
        )}
      </div>
    </div>
  );
}

function SuggestedQuestions({ onAsk }: { onAsk: (question: string) => void }) {
  return (
    <div className="pt-1">
      <p className="mb-2 font-mono text-xs text-muted">Try asking</p>
      <ul className="grid gap-1.5">
        {suggestedQuestions.map((question) => (
          <li key={question}>
            <Chip onClick={() => onAsk(question)}>{question}</Chip>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MessageBubble({ message, live }: { message: ChatEntry; live: boolean }) {
  if (message.role === "user") {
    return (
      <div className="max-w-[85%] self-end rounded-[12px_12px_4px_12px] border border-border bg-surface-raised px-3.5 py-2.5 text-sm leading-normal break-words text-foreground">
        <span className="sr-only">You: </span>
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    );
  }

  const waiting = live && message.content === "";

  return (
    <div className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
      <span
        aria-hidden="true"
        className="grid size-7 place-items-center rounded-lg border border-accent-line bg-accent-soft text-accent"
      >
        <Sparkle className="size-3.5" />
      </span>
      <div className="min-w-0 text-sm leading-[1.65] break-words text-foreground-soft">
        <span className="sr-only">AI: </span>
        {live && <span className="sr-only">AI is writing an answer.</span>}
        {waiting ? (
          <TypingDots />
        ) : (
          // Hidden while it streams so screen readers hear the finished answer
          // once; the new key re-mounts it as a fresh addition to the log.
          <div key={live ? "streaming" : "final"} aria-hidden={live || undefined}>
            <AnswerText text={message.content} />
          </div>
        )}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span aria-hidden="true" className="flex h-7 items-center gap-1">
      {[0, 160, 320].map((delay) => (
        <span
          key={delay}
          className="block size-1.5 rounded-full bg-muted motion-safe:animate-pulse"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

type AnswerBlock = { kind: "text"; text: string } | { kind: "list"; items: string[] };

const LIST_ITEM = /^\s*[-•]\s+(.*)$/;

/** Splits plain answer text into paragraphs and runs of "- " lines. */
function toAnswerBlocks(text: string): AnswerBlock[] {
  const blocks: AnswerBlock[] = [];
  for (const line of text.split("\n")) {
    const item = LIST_ITEM.exec(line);
    const last = blocks[blocks.length - 1];
    if (item) {
      if (last?.kind === "list") last.items.push(item[1]);
      else blocks.push({ kind: "list", items: [item[1]] });
    } else if (last?.kind === "text") {
      last.text += `\n${line}`;
    } else {
      blocks.push({ kind: "text", text: line });
    }
  }
  return blocks
    .map((block) =>
      block.kind === "text" ? { ...block, text: block.text.replace(/^\n+|\n+$/g, "") } : block,
    )
    .filter((block) => block.kind === "list" || block.text.trim() !== "");
}

function AnswerText({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-2.5">
      {toAnswerBlocks(text).map((block, index) =>
        block.kind === "list" ? (
          <BulletList key={index} items={block.items} className="whitespace-pre-wrap" />
        ) : (
          <p key={index} className="whitespace-pre-wrap">
            {block.text}
          </p>
        ),
      )}
    </div>
  );
}
