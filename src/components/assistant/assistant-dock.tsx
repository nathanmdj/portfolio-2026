"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { ArrowCounterClockwise, PaperPlaneRight, Sparkle, Stop, X } from "@phosphor-icons/react";
import { profile } from "@/content/profile";
import { CHAT_LIMITS } from "@/lib/assistant/contract";
import { modelLabels } from "@/lib/assistant/model-labels";
import { Button, buttonClasses } from "@/components/ui/button";
import { fieldClasses } from "@/components/ui/field";
import { Monogram } from "@/components/ui/monogram";
import { useAssistant } from "./assistant-context";
import { ChatThread } from "./chat-thread";
import { useChat, type ChatStatus } from "./use-chat";

/** The character counter appears once a message gets this close to the limit. */
const COUNTER_MARGIN = 200;

const launcherName = `Ask AI about ${profile.shortName}`;

export function AssistantDock() {
  const { isOpen, open, close, pendingQuestion, takePendingQuestion, takeOpener } = useAssistant();
  const { messages, status, error, send, stop, retry, reset } = useChat();
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const returnFocusOnClose = useRef(false);
  const titleId = useId();
  const disclosureId = useId();

  // Opening puts the cursor in the input; closing from inside the panel hands
  // focus back to the control that opened it, so a keyboard user keeps their
  // place on the page. The launcher stands in when that control is gone, which
  // includes the launcher itself: it is re-mounted when the panel closes.
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else if (returnFocusOnClose.current) {
      returnFocusOnClose.current = false;
      const opener = takeOpener();
      (opener?.isConnected ? opener : launcherRef.current)?.focus();
    }
  }, [isOpen, takeOpener]);

  // A question queued from elsewhere on the page (e.g. the fit report) is sent
  // once the dock is open and not already answering.
  useEffect(() => {
    if (!isOpen || !pendingQuestion || status === "streaming") return;
    const question = takePendingQuestion();
    if (question) send(question);
  }, [isOpen, pendingQuestion, status, takePendingQuestion, send]);

  const dismiss = () => {
    returnFocusOnClose.current = true;
    close();
  };

  const closeOnEscape = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    dismiss();
  };

  const focusInput = () => inputRef.current?.focus();

  if (!isOpen) {
    return (
      <button
        ref={launcherRef}
        type="button"
        onClick={() => open()}
        aria-label={launcherName}
        aria-haspopup="dialog"
        className={buttonClasses({
          size: "lg",
          // The floating shadow and pill shape replace the button's own.
          className:
            "fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-(--z-dock) rounded-full! shadow-float! sm:right-[max(1.5rem,env(safe-area-inset-right))] sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))]",
        })}
      >
        <Sparkle aria-hidden="true" className="size-4.5 shrink-0" />
        Ask AI
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={disclosureId}
      onKeyDown={closeOnEscape}
      // Below 640px the panel spans the width, 16px in from the edges and the
      // safe areas; above it, it floats as a 392px panel in the corner.
      className="fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] z-(--z-dock) flex max-h-[min(70dvh,calc(100dvh-6rem))] flex-col overflow-hidden rounded-card border border-border-strong bg-surface shadow-float sm:right-[max(1.5rem,env(safe-area-inset-right))] sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))] sm:left-auto sm:max-h-[calc(100dvh-7rem)] sm:w-[392px]"
    >
      <header className="flex items-center gap-3 border-b border-border bg-surface-strip py-3 pr-3 pl-4">
        <Monogram size="sm" />
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="text-[0.9375rem] tracking-[-0.01em]">
            Ask about {profile.shortName}
          </h2>
          <p className="flex items-start gap-1.5 text-xs text-muted">
            <span aria-hidden="true" className="mt-[5px] size-1.5 shrink-0 rounded-full bg-accent" />
            <span className="min-w-0">Answers come from his profile · {modelLabels.chat}</span>
          </p>
        </div>
        {/* Grouped without a gap so the title keeps one line at 375px. */}
        <div className="flex shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              reset();
              focusInput();
            }}
            disabled={messages.length === 0}
            aria-label="Clear conversation"
            title="Clear conversation"
          >
            <ArrowCounterClockwise aria-hidden="true" className="size-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={dismiss} aria-label="Close assistant">
            <X aria-hidden="true" className="size-5" />
          </Button>
        </div>
      </header>

      <ChatThread
        messages={messages}
        status={status}
        error={error}
        onAsk={(question) => {
          send(question);
          focusInput();
        }}
        onRetry={retry}
      />

      <ChatComposer
        inputRef={inputRef}
        status={status}
        onSend={send}
        onStop={() => {
          stop();
          focusInput();
        }}
      />

      <p id={disclosureId} className="px-4 pb-3 text-xs text-muted">
        AI answers can be wrong. Confirm details with {profile.shortName}.
      </p>
    </div>
  );
}

type ChatComposerProps = {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  status: ChatStatus;
  onSend: (text: string) => boolean;
  onStop: () => void;
};

/** Grows the field with its text; the CSS max-height caps it at four lines. */
function fitToContent(field: HTMLTextAreaElement) {
  field.style.height = "auto";
  field.style.height = `${field.scrollHeight + field.offsetHeight - field.clientHeight}px`;
}

function ChatComposer({ inputRef, status, onSend, onStop }: ChatComposerProps) {
  const [draft, setDraft] = useState("");
  const inputId = useId();
  const counterId = useId();
  const streaming = status === "streaming";
  const showCounter = draft.length >= CHAT_LIMITS.maxMessageChars - COUNTER_MARGIN;

  useEffect(() => {
    if (inputRef.current) fitToContent(inputRef.current);
  }, [draft, inputRef]);

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    if (streaming) return;
    if (onSend(draft)) setDraft("");
    // The Send button is replaced by Stop while answering; keep focus in the field.
    inputRef.current?.focus();
  };

  const sendOnEnter = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    submit();
  };

  return (
    <form onSubmit={submit} className="border-t border-border px-4 pt-3 pb-2">
      <label htmlFor={inputId} className="sr-only">
        Your question about {profile.shortName}
      </label>
      <div className="flex items-end gap-2">
        {/* Below 640px the text stays at 16px so iOS does not zoom the page on focus. */}
        <textarea
          ref={inputRef}
          id={inputId}
          rows={1}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={sendOnEnter}
          maxLength={CHAT_LIMITS.maxMessageChars}
          placeholder="Ask about projects, stack, availability…"
          aria-describedby={showCounter ? counterId : undefined}
          className={fieldClasses({
            className:
              "block max-h-[6.625rem] min-h-11 min-w-0 flex-1 resize-none px-3.5 py-3 text-base leading-5 sm:text-sm",
          })}
        />
        {streaming ? (
          <Button variant="secondary" size="icon" onClick={onStop} aria-label="Stop the answer">
            <Stop aria-hidden="true" weight="fill" className="size-4" />
          </Button>
        ) : (
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="Send question"
            className="grid size-11 shrink-0 place-items-center rounded-control bg-accent text-on-accent transition-colors duration-200 [--focus-ring:var(--foreground)] hover:not-disabled:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PaperPlaneRight aria-hidden="true" className="size-4.5" />
          </button>
        )}
      </div>
      {showCounter && (
        <p id={counterId} className="mt-2 text-right text-xs text-muted tabular-nums">
          {draft.length} / {CHAT_LIMITS.maxMessageChars} characters
        </p>
      )}
    </form>
  );
}
