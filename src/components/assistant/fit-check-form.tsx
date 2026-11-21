"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { FileText, LockSimple, WarningCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fieldClasses } from "@/components/ui/field";
import { RequestFailedNotice } from "@/components/ui/request-failed-notice";
import { Reveal } from "@/components/ui/reveal";
import { describeFailure, requestFit } from "@/lib/assistant/client";
import { FIT_LIMITS, type FitReport as FitReportData } from "@/lib/assistant/contract";
import { cx } from "@/lib/cx";
import { FitReport, FitReportPlaceholder, FitReportSkeleton, ResultFrame } from "./fit-report";

const formatCount = (value: number) => value.toLocaleString("en-US");

const READING_MESSAGE = "Reading the job description against the profile.";

/* A typical backend posting, with a few asks the profile does not cover, so
   the sample shows gaps as well as matches. */
const SAMPLE_JOB_DESCRIPTION = `Senior Backend Engineer (Python), remote

We are a small fintech team building a portfolio analytics platform for retail investors. You will own the API and data layer end to end and work closely with one frontend engineer.

What you will do
- Design and build REST APIs in Python (FastAPI preferred)
- Model PostgreSQL schemas, write migrations and tune slow queries
- Run background jobs and scheduled workers that ingest market data
- Deploy and operate services on AWS with Docker and GitHub Actions
- Help the frontend team ship features in our Next.js dashboard

Must have
- 3+ years building production backends in Python
- Solid PostgreSQL experience
- AWS (EC2, S3 or similar) and Docker in production
- Clear written communication; most of the team works in US time zones

Nice to have
- Backtesting, options pricing or other quantitative finance work
- Kubernetes
- Kafka or another event streaming system
- SOC 2 or other compliance experience`;

type FitState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; report: FitReportData; reportId: number };

function validationMessage(text: string): string | null {
  const length = text.trim().length;
  if (length < FIT_LIMITS.minChars) {
    return `Paste at least ${formatCount(FIT_LIMITS.minChars)} characters of the job description so there is enough to compare.`;
  }
  if (length > FIT_LIMITS.maxChars) {
    return `Keep it under ${formatCount(FIT_LIMITS.maxChars)} characters. The requirements matter more than the company boilerplate.`;
  }
  return null;
}

/** The job description form and the report (or failure) it produces. */
export function FitCheckForm() {
  const [jobDescription, setJobDescription] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const [state, setState] = useState<FitState>({ status: "idle" });
  const activeRequest = useRef<AbortController | null>(null);
  const lastSubmitted = useRef("");
  const reportCount = useRef(0);
  const fieldId = useId();
  const helpId = useId();
  const countId = useId();
  const problemId = useId();

  useEffect(() => () => activeRequest.current?.abort(), []);

  const runCheck = async (text: string) => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    lastSubmitted.current = text;
    setState({ status: "loading" });

    try {
      const report = await requestFit(text, { signal: controller.signal });
      if (controller.signal.aborted) return;
      reportCount.current += 1;
      setState({ status: "done", report, reportId: reportCount.current });
    } catch (error) {
      if (controller.signal.aborted) return;
      setState({ status: "error", message: describeFailure(error) });
    } finally {
      if (activeRequest.current === controller) activeRequest.current = null;
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = validationMessage(jobDescription);
    setProblem(message);
    if (message) return;
    void runCheck(jobDescription.trim());
  };

  const updateDraft = (value: string) => {
    setJobDescription(value);
    // Once a problem is shown, clear it as soon as the text is good enough.
    if (problem) setProblem(validationMessage(value));
  };

  const loading = state.status === "loading";
  const tooLong = jobDescription.trim().length > FIT_LIMITS.maxChars;
  const describedBy = cx(helpId, countId, problem && problemId);

  return (
    <>
      <Reveal className="flex flex-col">
        <Card className="flex flex-1 flex-col sm:p-8">
          <form noValidate onSubmit={submit} className="flex flex-1 flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <label htmlFor={fieldId} className="font-mono text-sm font-medium text-foreground">
                Job description
              </label>
              {/* Negative margins keep the 44px target without pushing the field down. */}
              <Button
                variant="ghost"
                className="-my-3"
                onClick={() => {
                  setJobDescription(SAMPLE_JOB_DESCRIPTION);
                  setProblem(null);
                }}
              >
                Try a sample
              </Button>
            </div>
            {/* Below 640px the text stays at 16px so iOS does not zoom the page on focus. */}
            <textarea
              id={fieldId}
              value={jobDescription}
              onChange={(event) => updateDraft(event.target.value)}
              aria-describedby={describedBy}
              aria-invalid={problem ? true : undefined}
              className={fieldClasses({
                invalid: Boolean(problem),
                className: cx(
                  "block min-h-60 w-full flex-1 resize-y p-4 text-base leading-[1.6] sm:text-[0.9375rem]",
                  !problem && "hover:border-border-strong",
                ),
              })}
              placeholder="Paste the role here — responsibilities, required stack, nice-to-haves…"
            />
            <p id={problemId} role="alert" className="flex gap-2 text-sm leading-relaxed text-danger empty:hidden">
              {problem && (
                <>
                  <WarningCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  <span>
                    <span className="font-medium">Check this:</span> {problem}
                  </span>
                </>
              )}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="grid gap-0.5 text-sm text-muted">
                <p id={helpId}>
                  Compared only against what is in my profile. At least{" "}
                  {formatCount(FIT_LIMITS.minChars)} characters.
                </p>
                {/* The field takes any length, so a long paste is flagged here rather than silently cut. */}
                <p id={countId} className={cx("tabular-nums", tooLong && "font-medium text-danger")}>
                  {tooLong && "Too long: "}
                  {formatCount(jobDescription.length)} / {formatCount(FIT_LIMITS.maxChars)} characters
                </p>
              </div>
              <Button type="submit" size="lg" loading={loading} className="max-sm:basis-full">
                {!loading && <FileText aria-hidden="true" className="size-4.5 shrink-0" />}
                {loading ? "Reading the role" : "Check the fit"}
              </Button>
            </div>

            <p className="flex gap-2 border-t border-border pt-4 text-xs leading-relaxed text-muted">
              <LockSimple aria-hidden="true" className="size-4 shrink-0" />
              <span>
                The text you paste is sent to Anthropic&apos;s API to generate this report. This site
                does not store it.
              </span>
            </p>
          </form>
        </Card>
      </Reveal>

      <Reveal delay={70} className="flex flex-col">
        {/* Only the wait is announced. A finished report takes focus on its
            heading instead, so it is not also read out in full from here. */}
        <p role="status" className="sr-only">
          {loading && READING_MESSAGE}
        </p>
        {state.status === "idle" && <FitReportPlaceholder />}
        {loading && <FitReportSkeleton />}
        <div role="alert" className={cx(state.status === "error" && "flex flex-1 flex-col")}>
          {state.status === "error" && (
            <ResultFrame>
              <RequestFailedNotice
                message={state.message}
                onRetry={() => void runCheck(lastSubmitted.current)}
                className="mt-6"
              />
            </ResultFrame>
          )}
        </div>
        {state.status === "done" && <FitReport key={state.reportId} report={state.report} />}
      </Reveal>
    </>
  );
}
