export function BrandMark({ mini = false }: { mini?: boolean }) {
  if (mini) return <span className="brand-mark mini">⌖</span>;

  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 36 36">
        <path d="M18 3.5c-6.2 0-11.2 4.8-11.2 10.8 0 8.1 11.2 18.2 11.2 18.2s11.2-10.1 11.2-18.2C29.2 8.3 24.2 3.5 18 3.5Z" />
        <path
          className="brand-path"
          d="M11 17c2.8-5.5 6.2 3.6 9.1-1.4 1.5-2.5 3.1-2.4 5-1.7"
        />
      </svg>
    </span>
  );
}
