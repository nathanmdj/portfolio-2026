import { FitCheckForm } from "@/components/assistant/fit-check-form";
import { Section } from "@/components/ui/section";
import { sectionHeading } from "@/lib/site-sections";

export function FitCheck() {
  return (
    <Section
      {...sectionHeading("fit")}
      title="Paste a job description. See where I match."
      intro={
        <p>
          The assistant compares your role against the facts in my profile and is honest about the
          gaps.
        </p>
      }
    >
      {/* Form and result sit side by side from 1024px and stretch to the same height. */}
      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        <FitCheckForm />
      </div>
    </Section>
  );
}
