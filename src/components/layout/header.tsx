export function Header() {
  return (
    <header className="h-14 md:h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
      <h1 className="text-primary font-bold tracking-wide text-sm md:text-lg leading-tight">
        <span className="hidden sm:inline">FIFA 2026 CORPORATE PRODE</span>
        <span className="sm:hidden">FIFA 2026 PRODE</span>
      </h1>
      <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border">
        <span className="font-bold text-primary text-sm">#42</span>
        <div className="w-px h-3.5 bg-slate-300" />
        <span className="text-xs md:text-sm font-medium text-slate-700">1,280 pts</span>
      </div>
    </header>
  );
}
