import Link from "next/link";

export default function NotFound() {
  return <main className="shell hub"><h1>page not found</h1><p className="lede">That coding job isn’t live.</p><Link href="/">See all jobs</Link></main>;
}
