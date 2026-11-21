"use client";

import { useEffect, useId, useRef, type ComponentType, type ReactNode } from "react";
import {
  Check,
  CheckCircle,
  ClipboardText,
  Minus,
  MinusCircle,
  X,
  type IconProps,
} from "@phosphor-icons/react";
import { profile } from "@/content/profile";
import type { FitReport as FitReportData, FitVerdict } from "@/lib/assistant/contract";
import { modelLabels } from "@/lib/assistant/model-labels";
import { cx } from "@/lib/cx";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { useAssistant } from "./assistant-context";

type VerdictTone = "match" | "partial" | "neutral";

const verdictTones: Record<VerdictTone, { panel: string; disc: string; title: string }> = {
  match: { panel: "border-accent/30 bg-accent-soft", disc: "bg-accent text-on-accent", title: "text-accent" },
  partial: { panel: "border-warn/30 bg-warn/10", disc: "bg-warn text-on-accent", title: "text-warn" },
  neutral: {
    panel: "border-border bg-background-inset",
    disc: "bg-surface-raised text-foreground-soft",
    title: "text-foreground",
  },
};

type VerdictStyle = { label: string; icon: ComponentType<IconProps>; tone: VerdictTone };

/* The label carries the meaning; the icon and tint only reinforce it. */
const verdictStyles: Record<FitVerdict, VerdictStyle> = {
  strong: { label: "Strong match", icon: Check, tone: "match" },
  good: { label: "Good match", icon: Check, tone: "match" },
  partial: { label: "Partial match", icon: Minus, tone: "partial" },
  weak: { label: "Not a match", icon: X, tone: "neutral" },
};

const subheading = "mt-7 font-mono text-[0.8125rem] font-medium text-muted";
const findingFrame =
  "grid grid-cols-[20px_minmax(0,1fr)] gap-3 rounded-control border border-border bg-background-inset p-4";

/** The card every state of the result column sits in, headed by the same caption. */
export function ResultFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Card className={cx("flex-1 sm:p-8", className)}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Badge>Fit report</Badge>
        <p className="text-sm text-muted">
          {modelLabels.fit} · compared against {profile.shortName}&apos;s profile
        </p>
      </div>
      {children}
    </Card>
  );
}

type VerdictPanelProps = {
  tone: VerdictTone;
  icon: ComponentType<IconProps>;
  title: ReactNode;
  children: ReactNode;
};

function VerdictPanel({ tone, icon: Icon, title, children }: VerdictPanelProps) {
  const colours = verdictTones[tone];
  return (
    <div className={cx("mt-6 flex items-center gap-4 rounded-xl border p-5", colours.panel)}>
      <span aria-hidden="true" className={cx("grid size-11 shrink-0 place-items-center rounded-full", colours.disc)}>
        <Icon weight="bold" className="size-5" />
      </span>
      <div className="min-w-0">
        {title}
        <div className="mt-0.5 text-sm leading-relaxed break-words text-foreground-soft">{children}</div>
      </div>
    </div>
  );
}

const verdictTitle = "font-mono text-[1.375rem] leading-[1.2] font-semibold tracking-normal";

export function FitReport({ report }: { report: FitReportData }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingId = useId();
  const { open } = useAssistant();
  const { label: verdict, icon, tone } = verdictStyles[report.verdict];

  // The report arrives after a wait; move focus to it so keyboard and screen
  // reader users land on the result. Each new report mounts afresh.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <article aria-labelledby={headingId} className="flex flex-1 flex-col">
      <ResultFrame>
        <VerdictPanel
          tone={tone}
          icon={icon}
          title={
            <h3
              ref={headingRef}
              id={headingId}
              tabIndex={-1}
              className={cx(verdictTitle, verdictTones[tone].title)}
            >
              <span className="sr-only">Fit report: </span>
              {verdict}
            </h3>
          }
        >
          <p>{report.summary}</p>
        </VerdictPanel>

        <FindingList
          title={report.matches.length === 1 ? "Match" : "Matches"}
          marker={CheckCircle}
          markerClassName="text-accent"
          entries={report.matches.map((match) => ({ term: match.requirement, detail: match.evidence }))}
          emptyText="Nothing in this description lines up clearly with the profile."
        />
        <FindingList
          title={report.gaps.length === 1 ? "Gap" : "Gaps"}
          marker={MinusCircle}
          markerClassName="text-warn"
          entries={report.gaps.map((gap) => ({ term: gap.requirement, detail: gap.note }))}
          emptyText="No gaps found against the stated requirements."
        />

        {report.questionsToAsk.length > 0 && (
          <>
            <h4 className={subheading}>Questions to ask {profile.shortName}</h4>
            <p className="mt-1 text-sm text-muted">Each one opens the AI assistant and asks it for you.</p>
            <ul className="mt-3 grid gap-1.5">
              {report.questionsToAsk.map((question) => (
                <li key={question}>
                  <Chip onClick={() => open(question)}>{question}</Chip>
                </li>
              ))}
            </ul>
          </>
        )}
      </ResultFrame>
    </article>
  );
}

type FindingEntry = { term: string; detail: string };

type FindingListProps = {
  title: string;
  marker: ComponentType<IconProps>;
  /** Colour of the marker icon beside each entry. */
  markerClassName: string;
  entries: FindingEntry[];
  emptyText: string;
};

function FindingList({ title, marker: Marker, markerClassName, entries, emptyText }: FindingListProps) {
  return (
    <>
      <h4 className={subheading}>{title}</h4>
      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-muted">{emptyText}</p>
      ) : (
        <ul className="mt-3 grid gap-3">
          {entries.map((entry, index) => (
            <li key={index} className={findingFrame}>
              <Marker aria-hidden="true" className={cx("mt-0.5 size-4.5", markerClassName)} />
              <div className="min-w-0 break-words">
                <strong className="block text-[0.9375rem] font-semibold text-foreground">{entry.term}</strong>
                <p className="mt-0.5 text-sm text-muted">{entry.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/** What the result column shows before any role has been checked. */
export function FitReportPlaceholder() {
  return (
    <ResultFrame>
      <VerdictPanel
        tone="neutral"
        icon={ClipboardText}
        title={<p className={cx(verdictTitle, "text-foreground")}>No role checked yet</p>}
      >
        <p>
          Paste a job description and press Check the fit. Matches, gaps and questions to ask
          appear here, each tied to the profile.
        </p>
      </VerdictPanel>
    </ResultFrame>
  );
}

function SkeletonBar({ className }: { className?: string }) {
  return <span className={cx("block h-4 rounded-md bg-surface-raised motion-safe:animate-pulse", className)} />;
}

/** Holds the report's place while Claude reads, so the page does not jump when it lands.
    Purely visual: the caller announces the wait. */
export function FitReportSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-1 flex-col">
      <ResultFrame>
        <div className={cx("mt-6 flex items-center gap-4 rounded-xl border p-5", verdictTones.neutral.panel)}>
          <span className="size-11 shrink-0 rounded-full bg-surface-raised motion-safe:animate-pulse" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <SkeletonBar className="h-6 w-40" />
            <SkeletonBar className="w-full" />
            <SkeletonBar className="w-2/3" />
          </div>
        </div>
        {[2, 1].map((rows, group) => (
          <div key={group}>
            <SkeletonBar className="mt-7 h-3.5 w-20" />
            <div className="mt-3 grid gap-3">
              {Array.from({ length: rows }, (_, row) => (
                <div key={row} className={findingFrame}>
                  <span className="mt-0.5 size-4.5 rounded-full bg-surface-raised motion-safe:animate-pulse" />
                  <div className="flex flex-col gap-2">
                    <SkeletonBar className="w-1/2" />
                    <SkeletonBar className="w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </ResultFrame>
    </div>
  );
}
