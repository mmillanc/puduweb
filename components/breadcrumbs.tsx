import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface Breadcrumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Breadcrumb[] }) {
  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link href="/" className="flex items-center hover:text-primary">
        <Home size={14} />
      </Link>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          <ChevronRight size={14} className="text-muted-foreground/50" />
          {item.href ? (
            <Link href={item.href} className="hover:text-primary">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
