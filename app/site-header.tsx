import Link from "next/link";

const links = [
  { href: "/", label: "jobs" },
  { href: "/compare", label: "compare" },
  { href: "/benchmarks", label: "benchmarks" },
  { href: "/models", label: "models" },
  { href: "/agents", label: "for agents" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="site-name" href="/">pickamodel.dev</Link>
      <nav aria-label="main">
        {links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
      </nav>
    </header>
  );
}
