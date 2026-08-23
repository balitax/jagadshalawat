export function CornerBrackets({
  color = "text-emerald-js/50",
}: {
  color?: string;
}) {
  const base = "pointer-events-none absolute h-4 w-4 border-current";
  return (
    <>
      <span className={`${base} left-2.5 top-2.5 border-l border-t ${color}`} aria-hidden="true" />
      <span className={`${base} right-2.5 top-2.5 border-r border-t ${color}`} aria-hidden="true" />
      <span className={`${base} bottom-2.5 left-2.5 border-b border-l ${color}`} aria-hidden="true" />
      <span className={`${base} bottom-2.5 right-2.5 border-b border-r ${color}`} aria-hidden="true" />
    </>
  );
}
