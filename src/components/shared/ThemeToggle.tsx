import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    >
      {isDark ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
