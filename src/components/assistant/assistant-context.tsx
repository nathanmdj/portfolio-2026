"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";

type AssistantState = {
  isOpen: boolean;
  /** Opens the dock; a question, when given, is queued for the dock to send. */
  open: (question?: string) => void;
  close: () => void;
  pendingQuestion: string | null;
  /** Returns the queued question and clears it, so it is sent exactly once. */
  takePendingQuestion: () => string | null;
  /** Returns the control that had focus when the dock was opened, once. */
  takeOpener: () => HTMLElement | null;
};

const AssistantContext = createContext<AssistantState | null>(null);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  // Mirrors the state so takePendingQuestion reads the latest value without
  // changing identity on every queue.
  const queued = useRef<string | null>(null);

  const opener = useRef<HTMLElement | null>(null);
  const openNow = useRef(false);

  const open = useCallback((question?: string) => {
    // Asking again while the dock is open must not overwrite where it was opened from.
    if (!openNow.current) {
      openNow.current = true;
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    // Guards against open being passed straight to onClick and receiving an event.
    const text = typeof question === "string" ? question.trim() : "";
    if (text) {
      queued.current = text;
      setPendingQuestion(text);
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    openNow.current = false;
    setIsOpen(false);
  }, []);

  const takeOpener = useCallback(() => {
    const element = opener.current;
    opener.current = null;
    return element;
  }, []);

  const takePendingQuestion = useCallback(() => {
    const question = queued.current;
    if (question !== null) {
      queued.current = null;
      setPendingQuestion(null);
    }
    return question;
  }, []);

  const value = useMemo(
    () => ({ isOpen, open, close, pendingQuestion, takePendingQuestion, takeOpener }),
    [isOpen, open, close, pendingQuestion, takePendingQuestion, takeOpener],
  );

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}

export function useAssistant(): AssistantState {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error("useAssistant must be used inside <AssistantProvider>.");
  }
  return context;
}

export type AskAssistantButtonProps = {
  /** Sent to the assistant as soon as the dock opens. Omit to just open it. */
  question?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
};

export function AskAssistantButton({
  question,
  variant = "primary",
  size = "md",
  className,
  children,
  "aria-label": ariaLabel,
}: AskAssistantButtonProps) {
  const { open } = useAssistant();
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      aria-label={ariaLabel}
      onClick={() => open(question)}
    >
      {children}
    </Button>
  );
}
