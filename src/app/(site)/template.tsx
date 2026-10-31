/** Переход между страницами: короткое проявление, без перекрытия контента. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-[fade-in_220ms_var(--ease-out)_both]">{children}</div>;
}
