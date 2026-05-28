import type { ReactNode } from "react";

interface NavItem {
  icon: string;
  label: string;
  onClick: () => void;
  active?: boolean;
}

interface ShellProps {
  children: ReactNode;
  navItems?: NavItem[];
  activeView?: string;
}

export function Shell({ children, navItems = [] }: ShellProps) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex h-screen">
        <aside
          className="flex flex-col border-r h-full shrink-0"
          style={{ width: "17rem", borderColor: "var(--line)", background: "var(--panel)" }}
        >
          <div className="p-6" style={{ fontFamily: "Fraunces, serif" }}>
            <div className="text-2xl font-bold">😂 LOL App</div>
            <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>Memes to make you laugh</div>
          </div>
          <nav className="flex-1 px-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-left w-full transition-all"
                style={{
                  background: item.active ? "var(--accent)" : "transparent",
                  color: item.active ? "#fff" : "var(--ink)",
                  fontWeight: item.active ? 600 : 400,
                }}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-4 text-xs" style={{ color: "var(--muted)" }}>
            <a
              href="https://freeappstore.online"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: "var(--muted)" }}
            >
              Part of FreeAppStore — free forever
            </a>
          </div>
        </aside>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* Mobile */}
      <div className="flex flex-col h-screen md:hidden">
        <header
          className="flex items-center px-4 h-14 border-b shrink-0"
          style={{ borderColor: "var(--line)", background: "var(--panel)" }}
        >
          <span className="font-bold text-lg" style={{ fontFamily: "Fraunces, serif" }}>
            😂 LOL App
          </span>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
        {navItems.length > 0 && (
          <nav
            className="flex items-center justify-around h-16 border-t shrink-0"
            style={{ borderColor: "var(--line)", background: "var(--panel)" }}
          >
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all"
                style={{ color: item.active ? "var(--accent)" : "var(--muted)" }}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}
