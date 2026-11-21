import { cx } from "@/lib/cx";

export type BulletListProps = {
  items: readonly string[];
  /** Sets the text size, colour and leading; the bullets follow the font size. */
  className?: string;
};

/** A plain list with small round bullets, used wherever the page lists points. */
export function BulletList({ items, className }: BulletListProps) {
  return (
    <ul className={cx("flex flex-col gap-2", className)}>
      {items.map((item, index) => (
        <li key={index} className="flex gap-2.5">
          <span aria-hidden="true" className="mt-[0.625em] size-1.5 shrink-0 rounded-full bg-muted" />
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}
