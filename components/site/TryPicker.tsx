import { ITEMS, formatSize, groupByKind } from "@/lib/models";

const GROUPS = groupByKind(ITEMS);

/**
 * The #try catalogue as a box per seeded item, grouped by kind. TryIt's pure
 * render half: it holds no state, so components/site/TryPicker.test.ts can
 * call it as a plain function.
 *
 * Every box is a native radio sharing one `name`, so arrow keys move the
 * selection across all groups and the checked state needs no ARIA of its own.
 * The selected box's look (.try-option in globals.css) borrows the terminal's
 * rule and offset shadow: it reads as the item that is in the terminal.
 */
export function TryPicker({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="download"
      className="flex flex-col gap-8"
    >
      {GROUPS.map((group) => (
        <fieldset key={group.kind} className="min-w-0">
          <legend className="meta mb-3 opacity-60">{group.label}</legend>
          <div className="grid grid-cols-2 gap-3">
            {group.items.map((item) => (
              <label key={item.id} className="try-option">
                <input
                  type="radio"
                  name="try-item"
                  value={item.id}
                  checked={item.id === selectedId}
                  onChange={() => onSelect(item.id)}
                  className="sr-only"
                />
                <span className="text-body leading-tight font-semibold tracking-[-0.01em]">
                  {item.name}
                </span>
                <span className="font-mono text-[12px] tabular-nums opacity-60">
                  {formatSize(item.bytes)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
