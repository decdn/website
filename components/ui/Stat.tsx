type Props = {
  label: string;
  value: string;
};

export function Stat({ label, value }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[10px] tracking-[0.24em] text-[color:var(--color-amber)] uppercase">
        {label}
      </span>
      <span className="font-display text-3xl leading-none text-[color:var(--color-phosphor)] bloom">
        {value}
      </span>
    </div>
  );
}
